// Authentication service connecting to the Spring Boot Backend-CGPS API.

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || ''

export interface UserView {
  id: string
  email: string
  displayName: string
  role: string
  provider: string
}

export interface LoginInput {
  email: string
  password?: string
}

export interface SignupInput {
  name: string
  email: string
  password?: string
}

export type AuthResult =
  | { ok: true; message?: string; user?: UserView }
  | { ok: false; message: string }

/**
 * Direct email login: authenticates the user immediately and returns user profile.
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  const email = input.email.trim()
  if (!email) {
    return { ok: false, message: 'Email is required.' }
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      const user = (await res.json().catch(() => null)) as UserView | null
      return {
        ok: true,
        user: user || undefined,
        message: 'Logged in successfully!',
      }
    }

    const errData = await res.json().catch(() => null)
    const errorMsg =
      errData?.message ||
      errData?.detail ||
      `Login failed (${res.status} ${res.statusText})`
    return { ok: false, message: errorMsg }
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Could not connect to the backend server. Is it running on port 8080?'
    return { ok: false, message }
  }
}

/**
 * Creates an account / requests a verification link with display name and email.
 */
export async function signup(input: SignupInput): Promise<AuthResult> {
  const email = input.email.trim()
  const displayName = input.name.trim()

  if (!email) {
    return { ok: false, message: 'Email is required.' }
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email,
        displayName,
        name: displayName,
      }),
    })

    if (res.status === 202 || res.status === 200) {
      const data = await res.json().catch(() => null)
      return {
        ok: true,
        message:
          data?.message ||
          `Verification link sent! Check ${email} to activate your account.`,
      }
    }

    const errData = await res.json().catch(() => null)
    const errorMsg =
      errData?.message ||
      errData?.detail ||
      `Registration failed (${res.status} ${res.statusText})`
    return { ok: false, message: errorMsg }
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Could not connect to the backend server. Is it running on port 8080?'
    return { ok: false, message }
  }
}

/**
 * Verifies a token from an emailed magic link to authenticate the session.
 */
export async function verifyMagicLink(token: string): Promise<AuthResult> {
  if (!token || !token.trim()) {
    return { ok: false, message: 'Token is missing or invalid.' }
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token: token.trim() }),
    })

    if (res.ok) {
      const user = (await res.json()) as UserView
      return { ok: true, user }
    }

    const errData = await res.json().catch(() => null)
    return {
      ok: false,
      message:
        errData?.message ||
        'The sign-in link is invalid, expired, or has already been used.',
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Could not complete verification. Server connection failed.'
    return { ok: false, message }
  }
}

/**
 * Retrieves the currently authenticated user's session profile.
 */
export async function getCurrentUser(): Promise<UserView | null> {
  try {
    const res = await fetch(`${API_BASE}/api/user/me`, {
      method: 'GET',
      credentials: 'include',
    })

    if (res.ok) {
      return (await res.json()) as UserView
    }
    return null
  } catch {
    return null
  }
}

/**
 * Fetches the campus welcome message.
 */
export async function getCampusWelcome(): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/campus/welcome`, {
      method: 'GET',
      credentials: 'include',
    })

    if (res.ok) {
      const data = await res.json()
      return data?.message || 'Welcome to Campus GPS!'
    }
    return 'Welcome to Campus GPS!'
  } catch {
    return 'Welcome to Campus GPS!'
  }
}

/**
 * Ends the user session.
 */
export async function logout(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Google OAuth URL that redirects through Spring Security.
 */
export function getGoogleAuthUrl(): string {
  return `${API_BASE || 'http://localhost:8080'}/oauth2/authorization/google`
}
