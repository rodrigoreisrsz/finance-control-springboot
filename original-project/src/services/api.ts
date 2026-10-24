
const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const jwt = sessionStorage.getItem('jwt')

  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (jwt) {
    headers.set('Authorization', `Bearer ${jwt}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    sessionStorage.removeItem('jwt')
  }

  return response
}
