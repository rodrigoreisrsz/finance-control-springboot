export type CategoriaRegistro =
  | 'MORADIA'
  | 'ALIMENTACAO'
  | 'TRANSPORTE'
  | 'SAUDE'
  | 'EDUCACAO'
  | 'LAZER'
  | 'COMPRAS'
  | 'CONTAS'
  | 'OUTROS'
  | 'RECEITAS'

export const categoriasOrcamento: Array<{ value: Exclude<CategoriaRegistro, 'RECEITAS'>; label: string }> = [
  { value: 'MORADIA', label: 'Moradia' },
  { value: 'ALIMENTACAO', label: 'Alimentação' },
  { value: 'TRANSPORTE', label: 'Transporte' },
  { value: 'SAUDE', label: 'Saúde' },
  { value: 'EDUCACAO', label: 'Educação' },
  { value: 'LAZER', label: 'Lazer' },
  { value: 'COMPRAS', label: 'Compras' },
  { value: 'CONTAS', label: 'Contas' },
  { value: 'OUTROS', label: 'Outros' },
]

export const categoriasRegistro: Array<{ value: CategoriaRegistro; label: string }> = [
  ...categoriasOrcamento,
  { value: 'RECEITAS', label: 'Receitas' },
]

const regrasCategoria: Array<[RegExp, CategoriaRegistro]> = [
  [/(aluguel|imovel|condominio|casa|moradia|iptu|prestacao)/, 'MORADIA'],
  [/(mercado|supermercado|alimentacao|comida|padaria|restaurante|lanches|delivery|cafe)/, 'ALIMENTACAO'],
  [/(transporte|onibus|uber|combustivel|gasolina|carro|metro|taxi|estacionamento)/, 'TRANSPORTE'],
  [/(saude|medico|farmacia|consulta|hospital|dentista|remedio)/, 'SAUDE'],
  [/(estudo|curso|escola|faculdade|livro|ensino)/, 'EDUCACAO'],
  [/(lazer|cinema|streaming|jogo|viagem|turismo|entretenimento)/, 'LAZER'],
  [/(conta|internet|energia|agua|luz|telefone)/, 'CONTAS'],
  [/(salario|bonus|freela|rendimento|ganho|reembolso|venda)/, 'RECEITAS'],
]

export function inferirCategoria(texto: string): CategoriaRegistro {
  const normalizado = texto.toLowerCase()
  return regrasCategoria.find(([regra]) => regra.test(normalizado))?.[1] ?? 'OUTROS'
}

export function obterCategoriaRegistro(registro: {
  categoria?: CategoriaRegistro | null
  nome: string
  descricao: string
}): CategoriaRegistro {
  return registro.categoria ?? inferirCategoria(`${registro.nome} ${registro.descricao}`)
}

export function rotuloCategoria(categoria: CategoriaRegistro): string {
  return categoriasRegistro.find((item) => item.value === categoria)?.label ?? 'Outros'
}
