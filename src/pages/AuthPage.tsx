import { useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { getGoogleAuthUrl, login, signup } from '../services/authService'
import type { UserView } from '../services/authService'
import {
  validateEmail,
  validateName,
} from '../utils/authValidation'
import '../styles/auth.css'

export type AuthMode = 'login' | 'signup'

interface AuthPageProps {
  mode: AuthMode
  onNavigate: (path: string) => void
  onUserAuthenticated?: (user: UserView) => void
}

interface Feedback {
  kind: 'error' | 'notice'
  text: string
}

function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.24A7.18 7.18 0 0 1 4.9 12c0-.78.13-1.54.37-2.24V6.61H1.25A11.967 11.967 0 0 0 0 12c0 1.92.45 3.74 1.25 5.39l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  )
}

export default function AuthPage({ mode, onNavigate, onUserAuthenticated }: AuthPageProps) {
  const isSignup = mode === 'signup'

  const [loginEmail, setLoginEmail] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(false)

  function goTo(path: string) {
    return (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      event.preventDefault()
      setFeedback(null)
      onNavigate(path)
    }
  }

  function handleGoogleAuth() {
    window.location.href = getGoogleAuthUrl()
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const problem = validateEmail(loginEmail)
    if (problem) {
      setFeedback({ kind: 'error', text: problem })
      return
    }
    setFeedback(null)
    setLoading(true)
    const result = await login({
      email: loginEmail.trim(),
    })
    setLoading(false)

    if (result.ok) {
      if (result.user && onUserAuthenticated) {
        onUserAuthenticated(result.user)
      }
      onNavigate('/home')
    } else {
      setFeedback({ kind: 'error', text: result.message })
    }
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const problem =
      validateName(signupName) || validateEmail(signupEmail)
    if (problem) {
      setFeedback({ kind: 'error', text: problem })
      return
    }
    setFeedback(null)
    setLoading(true)
    const result = await signup({
      name: signupName.trim(),
      email: signupEmail.trim(),
    })
    setLoading(false)

    if (result.ok) {
      if (result.user && onUserAuthenticated) {
        onUserAuthenticated(result.user)
        onNavigate('/home')
      } else {
        setFeedback({
          kind: 'notice',
          text:
            result.message ||
            'Account registered! We sent a verification link to your email.',
        })
      }
    } else {
      setFeedback({ kind: 'error', text: result.message })
    }
  }

  const loginFeedback = !isSignup ? feedback : null
  const signupFeedback = isSignup ? feedback : null

  return (
    <div className="auth-page">
      <div className={`auth-container ${isSignup ? 'signup-mode' : ''}`}>
        {/* LOGIN PANEL */}
        <div className="form-panel login-panel" inert={isSignup}>
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <h2>Welcome back</h2>
            <p>Enter your email to log in and check live bus queues.</p>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleAuth}
              title="Sign in with Google"
            >
              <GoogleIcon /> Sign in with Google
            </button>

            <div className="auth-divider">
              <span>or enter email</span>
            </div>

            <label className="sr-only" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Campus Email (e.g. alex@campus.edu)"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />

            {loginFeedback && (
              <div
                className={
                  loginFeedback.kind === 'error' ? 'auth-error' : 'auth-notice'
                }
                role={loginFeedback.kind === 'error' ? 'alert' : 'status'}
              >
                {loginFeedback.text}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading && !isSignup ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              className="guest-btn"
              onClick={goTo('/home')}
              title="Continue to live transit without signing in"
            >
              Continue as guest
            </button>

            <button
              type="button"
              className="auth-home-link"
              onClick={goTo('/home')}
            >
              Home
            </button>
          </form>
        </div>

        {/* SIGNUP PANEL */}
        <div className="form-panel signup-panel" inert={!isSignup}>
          <form className="auth-form" onSubmit={handleSignup} noValidate>
            <h2>Create account</h2>
            <p>Sign up to follow bus queues and wait times.</p>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleAuth}
              title="Sign up with Google"
            >
              <GoogleIcon /> Sign up with Google
            </button>

            <div className="auth-divider">
              <span>or register with email</span>
            </div>

            <label className="sr-only" htmlFor="signup-name">
              Display Name
            </label>
            <input
              id="signup-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Display Name (e.g. Alex River)"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              required
            />

            <label className="sr-only" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Campus Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
            />

            {signupFeedback && (
              <div
                className={
                  signupFeedback.kind === 'error' ? 'auth-error' : 'auth-notice'
                }
                role={signupFeedback.kind === 'error' ? 'alert' : 'status'}
              >
                {signupFeedback.text}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading && isSignup ? 'Sending link...' : 'Sign Up with Magic Link'}
            </button>

            <button
              type="button"
              className="guest-btn"
              onClick={goTo('/home')}
              title="Continue to live transit without signing in"
            >
              Continue as guest
            </button>

            <button
              type="button"
              className="auth-home-link"
              onClick={goTo('/home')}
            >
              Home
            </button>
          </form>
        </div>

        {/* OVERLAY PANEL */}
        <div className="overlay-panel">
          <div className="overlay-content">
            <div className="auth-logo">🚌 CGPS</div>

            {!isSignup ? (
              <>
                <h1>New here?</h1>
                <p>
                  Create an account to keep an eye on bus queues and know when
                  to head to the stop.
                </p>
                <a
                  href="/signup"
                  className="ghost-btn"
                  onClick={goTo('/signup')}
                >
                  Create Account
                </a>
              </>
            ) : (
              <>
                <h1>Already have an account?</h1>
                <p>
                  Login and pick up right where you left off with the live bus
                  queues.
                </p>
                <a href="/login" className="ghost-btn" onClick={goTo('/login')}>
                  Login
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
