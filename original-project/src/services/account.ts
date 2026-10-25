import { apiFetch } from './api'

export interface AccountProfile {
  id: number
  name: string
  email: string
}

export async function buscarPerfil(): Promise<AccountProfile> {
  const response = await apiFetch('/user/me')
  if (!response.ok) {
    throw new Error('Não foi possível carregar os dados da conta.')
  }
  return response.json() as Promise<AccountProfile>
}
