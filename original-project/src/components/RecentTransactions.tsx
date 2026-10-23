import type { Registro } from '../services/registros'
import './RecentTransactions.css'

type Props = { registros: Registro[]; search?: string }
const moeda = (value: number | string) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dataPt = (value: string) => {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}/${month}/${year}` : value
}

function RecentTransactions({ registros, search = '' }: Props) {
  const filtrados = [...registros]
    .filter((r) => `${r.nome} ${r.descricao} ${r.tipoRegistro}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
    .slice(0, 8)

  return (
    <section className="transactions-card">
      <div className="section-heading">
        <div><h2>Transações recentes</h2><p>Seus registros mais recentes</p></div>
        <span className="transaction-count">{filtrados.length} registros</span>
      </div>
      <div className="transactions-table-wrapper">
        <table className="transactions-table">
          <thead><tr><th>Registro</th><th>Data</th><th>Tipo</th><th>Valor</th></tr></thead>
          <tbody>
            {filtrados.map((r) => <tr key={r.id}>
              <td><strong>{r.nome}</strong><small>{r.descricao || 'Sem descrição'}</small></td>
              <td>{dataPt(r.data)}</td>
              <td><span className={`type-pill ${r.tipoRegistro === 'GANHO' ? 'income' : 'expense'}`}>{r.tipoRegistro === 'GANHO' ? 'Entrada' : 'Despesa'}</span></td>
              <td className={r.tipoRegistro === 'GANHO' ? 'transaction-income' : 'transaction-expense'}>{r.tipoRegistro === 'GANHO' ? '+' : '−'} {moeda(r.valor)}</td>
            </tr>)}
            {filtrados.length === 0 && <tr><td colSpan={4} className="empty-state">Nenhum registro encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}
export default RecentTransactions
