import { apiFetch } from './api'

export interface Cofre {
  id: number
  nome: string
  meta: number | string
  valorAtual: number | string | null
}

export interface CofrePayload {
  nome: string
  meta: number | string
  deposito?: number | string
}

export interface Aporte {
  id: number
  valor: number | string | null
  data: string | null
  cofre?: {
    id: number
    nome?: string
  }
}

export interface AportePayload {
  cofreId: number
  valor: number | string
  data: string
}

async function lerErro(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return body.message || body.error || fallback
  } catch {
    return fallback
  }
}

export async function listarCofres(): Promise<Cofre[]> {
  const response = await apiFetch('/cofre')
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível carregar os cofres.'))
  return response.json() as Promise<Cofre[]>
}

export async function criarCofre(payload: CofrePayload): Promise<Cofre> {
  const response = await apiFetch('/cofre', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível criar o cofre.'))
  return response.json() as Promise<Cofre>
}

export async function editarCofre(id: number, payload: Pick<CofrePayload, 'nome' | 'meta'>): Promise<Cofre> {
  const response = await apiFetch(`/cofre/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível editar o cofre.'))
  return response.json() as Promise<Cofre>
}

export async function excluirCofre(id: number): Promise<void> {
  const response = await apiFetch(`/cofre/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível excluir o cofre.'))
}

export async function listarAportes(): Promise<Aporte[]> {
  const response = await apiFetch('/cofre/aportes')
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível carregar o histórico de aportes.'))
  return response.json() as Promise<Aporte[]>
}

export async function criarAporte(payload: AportePayload): Promise<Cofre> {
  const response = await apiFetch('/cofre/aportes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível registrar o aporte.'))
  return response.json() as Promise<Cofre>
}
