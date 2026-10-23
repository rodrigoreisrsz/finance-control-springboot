
import { apiFetch } from './api'

export async function listarRegistros() {
  const response = await apiFetch('/registros')

  if (!response.ok) {
    throw new Error('Não foi possível carregar os registros.')
  }

  return response.json()
}
