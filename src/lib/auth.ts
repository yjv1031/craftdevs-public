const ACCESS_TOKEN_KEY = 'auth.accessToken'
const REFRESH_TOKEN_KEY = 'auth.refreshToken'
const TOKEN_TYPE_KEY = 'auth.tokenType'

export type AuthTokenPayload = {
  accessToken: string
  refreshToken: string
  tokenType?: string
}

export function setAuthTokens(payload: AuthTokenPayload) {
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
  localStorage.setItem(TOKEN_TYPE_KEY, payload.tokenType ?? 'Bearer')
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getTokenType() {
  return localStorage.getItem(TOKEN_TYPE_KEY) ?? 'Bearer'
}

export function isLoggedIn() {
  return Boolean(getAccessToken())
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
}
