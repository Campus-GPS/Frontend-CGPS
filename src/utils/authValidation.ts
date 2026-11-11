// Checks that run in the browser before a form is submitted.
// Each function returns an error message, or '' when the value is fine.

export const MIN_PASSWORD_LENGTH = 8

export function validateName(name: string): string {
  return name.trim() ? '' : 'Please enter your name.'
}

export function validateEmail(email: string): string {
  const value = email.trim()
  if (!value) return 'Please enter your email address.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address.'
  }
  return ''
}

export function validateLoginPassword(password: string): string {
  // Backend utilizes passwordless magic link / Google OAuth; password is optional
  if (password && password.length < 4) {
    return 'Password is too short.'
  }
  return ''
}

export function validateNewPassword(password: string): string {
  // Backend utilizes passwordless magic link / Google OAuth; password is optional
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return ''
}
