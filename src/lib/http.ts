import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  getTokenType,
  setAuthTokens,
} from './auth'

type RefreshResponse = {
  tokenType: string
  accessToken: string
  refreshToken: string
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

function redirectToLogin() {
  window.location.assign('/login')
}

async function tryRefreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return false
  }

  const response = await fetch(`${BACKEND_URL}/public/user/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    return false
  }

  const data = (await response.json()) as RefreshResponse
  if (!data.accessToken || !data.refreshToken) {
    return false
  }

  setAuthTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    tokenType: data.tokenType,
  })

  return true
}

function buildAuthHeaders(headers?: HeadersInit): Headers {
  const nextHeaders = new Headers(headers)
  const accessToken = getAccessToken()
  if (accessToken) {
    nextHeaders.set('Authorization', `${getTokenType()} ${accessToken}`)
  }
  return nextHeaders
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const runRequest = (withAuth: boolean) =>
    fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: withAuth ? buildAuthHeaders(init?.headers) : init?.headers,
    })

  let response = await runRequest(true)
  if (response.status !== 401 && response.status !== 403) {
    return response
  }

  const refreshed = await tryRefreshAccessToken()
  if (!refreshed) {
    clearAuthTokens()
    redirectToLogin()
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
  }

  response = await runRequest(true)
  if (response.status === 401 || response.status === 403) {
    clearAuthTokens()
    redirectToLogin()
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
  }

  return response
}
