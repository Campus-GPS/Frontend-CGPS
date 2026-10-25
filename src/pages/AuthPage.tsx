import { useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { login, signup } from '../services/authService'
import {
  validateEmail,
  validateLoginPassword,
  validateName,
  validateNewPassword,
} from '../utils/authValidation'
import '../styles/auth.css'

export type AuthMode = 'login' | 'signup'

interface AuthPageProps {
  mode: AuthMode
  onNavigate: (path: string) => void
}

// Message shown under a form: a validation error or a status notice.
interface Feedback {
  kind: 'error' | 'notice'
  text: string
}

export default function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const isSignup = mode === 'signup'

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(false)

  // Real <a href> links still work (open in new tab, copy link), but a normal
  // click slides the panel instead of reloading the page.
  function goTo(path: string) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      setFeedback(null)
      onNavigate(path)
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const problem =
      validateEmail(loginEmail) || validateLoginPassword(loginPassword)
    if (problem) {
      setFeedback({ kind: 'error', text: problem })
      return
    }
    setFeedback(null)
    setLoading(true)
    const result = await login({ email: loginEmail.trim(), password: loginPassword })
    setLoading(false)
    setFeedback(
      result.ok
        ? { kind: 'notice', text: 'Logged in.' }
        : { kind: 'notice', text: result.message },
    )
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const problem =
      validateName(signupName) ||
      validateEmail(signupEmail) ||
      validateNewPassword(signupPassword)
    if (problem) {
      setFeedback({ kind: 'error', text: problem })
      return
    }
    setFeedback(null)
    setLoading(true)
    const result = await signup({
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
    })
    setLoading(false)
    setFeedback(
      result.ok
        ? { kind: 'notice', text: 'Account created.' }
        : { kind: 'notice', text: result.message },
    )
  }

  const loginFeedback = !isSignup ? feedback : null
  const signupFeedback = isSignup ? feedback : null

  return (
    <div className="auth-page">
      <div className={`auth-container ${isSignup ? 'signup-mode' : ''}`}>
        <div className="form-panel login-panel" inert={isSignup}>
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <h2>Welcome back</h2>
            <p>Login to check live bus queues around campus.</p>

            <label className="sr-only" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <label className="sr-only" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            {loginFeedback && (
              <div
                className={loginFeedback.kind === 'error' ? 'auth-error' : 'auth-notice'}
                role={loginFeedback.kind === 'error' ? 'alert' : 'status'}
              >
                {loginFeedback.text}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading && !isSignup ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        <div className="form-panel signup-panel" inert={!isSignup}>
          <form className="auth-form" onSubmit={handleSignup} noValidate>
            <h2>Create account</h2>
            <p>Sign up to follow bus queues and wait times.</p>

            <label className="sr-only" htmlFor="signup-name">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />

            <label className="sr-only" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />

            <label className="sr-only" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />

            {signupFeedback && (
              <div
                className={signupFeedback.kind === 'error' ? 'auth-error' : 'auth-notice'}
                role={signupFeedback.kind === 'error' ? 'alert' : 'status'}
              >
                {signupFeedback.text}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading && isSignup ? 'Creating...' : 'Sign Up'}
            </button>
          </form>
        </div>

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
                <a href="/signup" className="ghost-btn" onClick={goTo('/signup')}>
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
