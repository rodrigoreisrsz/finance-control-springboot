import { apiFetch } from './api'

export type TipoRegistro = 'GANHO' | 'GASTO'

export interface Registro {
  id: number
  nome: string
  valor: number | string
  data: string
  descricao: string
  tipoRegistro: TipoRegistro
}

export interface RegistroPayload {
  nome: string
  valor: number
  descricao: string
  data: string
  tipoRegistro: TipoRegistro
}

async function lerErro(response: Response, fallback: string) {
  try {
    const body = await response.json()
    return body.message || body.error || fallback
  } catch {
    return fallback
  }
}

export async function listarRegistros(): Promise<Registro[]> {
  const response = await apiFetch('/registros')
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível carregar os registros.'))
  return response.json() as Promise<Registro[]>
}

export async function criarRegistro(payload: RegistroPayload): Promise<Registro> {
  const response = await apiFetch('/registros', { method: 'POST', body: JSON.stringify(payload) })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível cadastrar o registro.'))
  return response.json() as Promise<Registro>
}

export async function editarRegistro(id: number, payload: RegistroPayload): Promise<Registro> {
  const response = await apiFetch(`/registros/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível editar o registro.'))
  return response.json() as Promise<Registro>
}

export async function excluirRegistro(id: number): Promise<void> {
  const response = await apiFetch(`/registros/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível excluir o registro.'))
}
