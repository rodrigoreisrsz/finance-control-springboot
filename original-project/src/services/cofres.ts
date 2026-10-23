import { apiFetch } from './api'

export interface Cofre {
  id: number
  nome: string
  meta: number | string
  valorAtual: number | string | null
}

export async function listarCofres(): Promise<Cofre[]> {
  const response = await apiFetch('/cofre')
  if (!response.ok) throw new Error('Não foi possível carregar os cofres.')
  return response.json() as Promise<Cofre[]>
}
