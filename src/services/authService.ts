// Placeholder for the real authentication backend.
//
// The login and signup pages call these two functions when a form is valid.
// No backend is connected yet, so both functions simply report that.
// When a backend exists, replace the body of each function with a real
// request and return { ok: true } or { ok: false, message: '...' }.

export interface LoginInput {
  email: string
  password: string
}

export interface SignupInput {
  name: string
  email: string
  password: string
}

export type AuthResult = { ok: true } | { ok: false; message: string }

const NOT_CONNECTED: AuthResult = {
  ok: false,
  message:
    'Your details look valid, but sign-in is not connected to a server yet. This is the design preview only.',
}

export async function login(input: LoginInput): Promise<AuthResult> {
  void input
  return NOT_CONNECTED
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  void input
  return NOT_CONNECTED
}
