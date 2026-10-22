
import './RecentTransactions.css'

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

function RecentTransactions() {
  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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
            {transactions.map((transaction) => (
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
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RecentTransactions
