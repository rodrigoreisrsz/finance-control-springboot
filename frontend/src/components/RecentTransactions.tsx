
import './RecentTransactions.css'

type RecentTransactionsProps = {
  search: string
}

const transactions = [
  {
    id: 1,
    description: 'Salário',
    category: 'Renda',
    date: '05/10/2026',
    type: 'GANHO',
    value: 3500,
  },
  {
    id: 2,
    description: 'Supermercado',
    category: 'Alimentação',
    date: '08/10/2026',
    type: 'GASTO',
    value: 350,
  },
  {
    id: 3,
    description: 'Conta de internet',
    category: 'Moradia',
    date: '10/10/2026',
    type: 'GASTO',
    value: 100,
  },
]

function RecentTransactions({ search }: RecentTransactionsProps) {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

  const term = search.trim().toLowerCase()

  const filteredTransactions = transactions.filter((transaction) => {
    return (
      transaction.description.toLowerCase().includes(term) ||
      transaction.category.toLowerCase().includes(term) ||
      transaction.type.toLowerCase().includes(term)
    )
  })

  return (
    <section className="transactions-card">
      <h2>Transações recentes</h2>

      <div className="transactions-table-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Data</th>
              <th>Valor</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.description}</td>
                <td>{transaction.category}</td>
                <td>{transaction.date}</td>
                <td
                  className={
                    transaction.type === 'GANHO'
                      ? 'transaction-income'
                      : 'transaction-expense'
                  }
                >
                  {transaction.type === 'GANHO' ? '+' : '-'}
                  {formatCurrency(transaction.value)}
                </td>
              </tr>
            ))}

            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={4}>Nenhuma transação encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RecentTransactions
