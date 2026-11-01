import { apiFetch } from './api'
import type { CategoriaRegistro } from './categorias'
import type { TipoRegistro } from './registros'

export interface Recorrencia {
  id: number
  nome: string
  valor: number | string
  descricao: string
  tipoRegistro: TipoRegistro
  categoria: CategoriaRegistro
  diaDoMes: number
  dataInicio: string
  proximaExecucao: string
  ativa: boolean
  confirmacaoObrigatoria: boolean
  aguardandoRevisao: boolean
}

export interface RecorrenciaPayload {
  nome: string
  valor: number
  descricao: string
  tipoRegistro: TipoRegistro
  categoria: CategoriaRegistro
  diaDoMes: number
  dataInicio: string
  confirmacaoObrigatoria: boolean
}

async function lerErro(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json()
    return body.message || body.error || fallback
  } catch {
    return fallback
  }
}

export async function listarRecorrencias(): Promise<Recorrencia[]> {
  const response = await apiFetch('/recorrencias')
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível carregar os lançamentos recorrentes.'))
  return response.json() as Promise<Recorrencia[]>
}

export async function criarRecorrencia(payload: RecorrenciaPayload): Promise<Recorrencia> {
  const response = await apiFetch('/recorrencias', { method: 'POST', body: JSON.stringify(payload) })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível criar o lançamento recorrente.'))
  return response.json() as Promise<Recorrencia>
}

export async function alterarStatusRecorrencia(id: number, ativa: boolean): Promise<Recorrencia> {
  const response = await apiFetch(`/recorrencias/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ ativa }),
  })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível atualizar o lançamento recorrente.'))
  return response.json() as Promise<Recorrencia>
}

export async function executarRecorrencia(id: number): Promise<void> {
  const response = await apiFetch(`/recorrencias/${id}/executar`, { method: 'POST' })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível confirmar o lançamento.'))
}

export async function excluirRecorrencia(id: number): Promise<void> {
  const response = await apiFetch(`/recorrencias/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível excluir o lançamento recorrente.'))
}
