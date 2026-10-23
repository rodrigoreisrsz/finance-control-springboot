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

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('E-mail ou senha inválidos.')
    }
    throw new Error('Não foi possível entrar. Tente novamente.')
  }

  const data: LoginResponse = await response.json()
  if (!data.jwt) throw new Error('A API não retornou o token de autenticação.')
  return data
}

export async function register(user: RegisterRequest): Promise<void> {
  const response = await fetch(`${API_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })

  if (!response.ok) {
    let message = 'Não foi possível criar sua conta. Confira os dados e tente novamente.'
    try {
      const data: unknown = await response.json()
      if (data && typeof data === 'object') {
        const body = data as Record<string, unknown>
        const candidate = body.message ?? body.mensagem ?? body.error
        if (typeof candidate === 'string' && candidate.trim()) message = candidate
      }
    } catch {
      // Algumas respostas de erro da API não possuem corpo JSON.
    }
    if (response.status === 409) message = 'Já existe uma conta com esses dados.'
    throw new Error(message)
  }
}
