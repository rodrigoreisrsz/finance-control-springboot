
const API_URL = import.meta.env.VITE_API_URL

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  id: number
  name: string
  jwt: string
}

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('E-mail ou senha inválidos.')
    }

    throw new Error('Não foi possível entrar. Tente novamente.')
  }

  const data: LoginResponse = await response.json()

  if (!data.jwt) {
    throw new Error('A API não retornou o token de autenticação.')
  }

  return data
}
