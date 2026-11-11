import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import { getCurrentUser, verifyMagicLink } from './services/authService'
import type { UserView } from './services/authService'
import './styles/auth.css'

export type PageRoute = 'login' | 'signup' | 'home' | 'verify'

function routeFromPath(path: string): PageRoute {
  const clean = path.replace(/\/+$/, '')
  if (clean === '/signup') return 'signup'
  if (clean === '/login') return 'login'
  if (clean === '/home') return 'home'
  if (clean === '/auth/verify' || clean === '/verify') return 'verify'
  // Default to login so sign-in/sign-up is the first thing users see
  return 'login'
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [currentUser, setCurrentUser] = useState<UserView | null>(null)
  const [verifyState, setVerifyState] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error'
    message: string
  }>({ status: 'idle', message: '' })

  // Keep path synced with browser history
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Check current session on load
  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUser(user)
      }
    }
    checkAuth()
  }, [])

  // Ensure root URL opens /login as the default landing view
  useEffect(() => {
    const clean = path.replace(/\/+$/, '')
    if (clean === '' || clean === '/') {
      window.history.replaceState(null, '', '/login')
    }
  }, [path])

  // Handle /auth/verify magic link flow
  useEffect(() => {
    const route = routeFromPath(path)
    if (route === 'verify') {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      if (!token) {
        setVerifyState({
          status: 'error',
          message: 'No verification token was found in the link.',
        })
        return
      }

      setVerifyState({
        status: 'loading',
        message: 'Verifying your sign-in link with Campus GPS...',
      })

      verifyMagicLink(token).then((res) => {
        if (res.ok && res.user) {
          setCurrentUser(res.user)
          setVerifyState({
            status: 'success',
            message: `Welcome back, ${res.user.displayName || res.user.email}! Redirecting to campus transit...`,
          })
          setTimeout(() => {
            navigate('/home')
          }, 1500)
        } else {
          setVerifyState({
            status: 'error',
            message:
              res.message ||
              'This sign-in link is invalid or has expired. Please request a new one.',
          })
        }
      })
    }
  }, [path])

  function navigate(to: string) {
    window.history.pushState(null, '', to)
    setPath(to)
  }

  const currentRoute = routeFromPath(path)

  if (currentRoute === 'verify') {
    return (
      <div className="auth-page">
        <div
          style={{
            maxWidth: '500px',
            width: '90%',
            padding: '40px',
            borderRadius: '24px',
            background: 'rgba(10, 14, 39, 0.94)',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <div className="auth-logo" style={{ marginBottom: '16px' }}>
            🚌 CGPS
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>
            {verifyState.status === 'loading' && 'Authenticating...'}
            {verifyState.status === 'success' && 'Signed In!'}
            {verifyState.status === 'error' && 'Verification Issue'}
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '15px',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}
          >
            {verifyState.message}
          </p>

          {verifyState.status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #00d4ff, #0099ff)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Back to Sign In
            </button>
          )}

          {verifyState.status === 'success' && (
            <button
              onClick={() => navigate('/home')}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
                color: '#0a0e27',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Go to Home Page
            </button>
          )}
        </div>
      </div>
    )
  }

  if (currentRoute === 'home') {
    return <HomePage onNavigate={navigate} user={currentUser} />
  }

  return (
    <AuthPage
      mode={currentRoute === 'signup' ? 'signup' : 'login'}
      onNavigate={navigate}
      onUserAuthenticated={(user) => setCurrentUser(user)}
    />
  )
}

export default App
