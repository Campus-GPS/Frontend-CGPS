import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import type { AuthMode } from './pages/AuthPage'

// Tiny built-in routing (no extra package): the browser address decides which
// page is shown. /login and /signup are the two auth pages; anything else
// (including /) is sent to /login.
function modeFromPath(path: string): AuthMode | null {
  const clean = path.replace(/\/+$/, '')
  if (clean === '/login') return 'login'
  if (clean === '/signup') return 'signup'
  return null
}

function App() {
  const [path, setPath] = useState(window.location.pathname)

  // Keep the page in step with the browser's back/forward buttons.
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Unknown address: the login page is shown (see below), and the address bar
  // is corrected to /login.
  useEffect(() => {
    if (modeFromPath(path) === null) {
      window.history.replaceState(null, '', '/login')
    }
  }, [path])

  function navigate(to: string) {
    window.history.pushState(null, '', to)
    setPath(to)
  }

  return <AuthPage mode={modeFromPath(path) ?? 'login'} onNavigate={navigate} />
}

export default App
