import { apiFetch } from './api'
import type { CategoriaRegistro } from './categorias'

export interface Orcamento {
  id: number
  categoria: CategoriaRegistro
  valor: number | string
  mes: string
}

export interface OrcamentoPayload {
  categoria: CategoriaRegistro
  valor: number
  mes: string
}

async function lerErro(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json()
    return body.message || body.error || fallback
  } catch {
    return fallback
  }
}

export async function listarOrcamentos(mes: string): Promise<Orcamento[]> {
  const response = await apiFetch(`/orcamentos?mes=${encodeURIComponent(mes)}`)
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível carregar os orçamentos.'))
  return response.json() as Promise<Orcamento[]>
}

export async function salvarOrcamento(payload: OrcamentoPayload): Promise<Orcamento> {
  const response = await apiFetch('/orcamentos', { method: 'POST', body: JSON.stringify(payload) })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível salvar o orçamento.'))
  return response.json() as Promise<Orcamento>
}

export async function excluirOrcamento(id: number): Promise<void> {
  const response = await apiFetch(`/orcamentos/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await lerErro(response, 'Não foi possível excluir o orçamento.'))
}
