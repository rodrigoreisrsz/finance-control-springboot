import type { Registro } from '../services/registros'
import './MonthlyChart.css'

type Props = { registros: Registro[] }
const moeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
function MonthlyChart({ registros }: Props) {
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const year = date.getFullYear()
    const month = date.getMonth()
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', '')
    const items = registros.filter((r) => {
      const d = new Date(`${r.data}T12:00:00`)
      return d.getFullYear() === year && d.getMonth() === month
    })
    return {
      month: label,
      entradas: items.filter((r) => r.tipoRegistro === 'GANHO').reduce((s, r) => s + Number(r.valor), 0),
      despesas: items.filter((r) => r.tipoRegistro === 'GASTO').reduce((s, r) => s + Number(r.valor), 0),
    }
  })
  const maxValue = Math.max(1, ...monthlyData.flatMap((d) => [d.entradas, d.despesas]))
  return <section className="monthly-chart">
    <div className="section-heading"><div><h2>Entradas x despesas</h2><p className="chart-subtitles">Movimentação dos últimos seis meses</p></div></div>
    <div className="chart-legend"><span><i className="legend-income" /> Entradas</span><span><i className="legend-expense" /> Despesas</span></div>
    <div className="chart-bars" key={monthlyData.map((item) => `${item.month}:${item.entradas}:${item.despesas}`).join('|')}>
      {monthlyData.map((item) => <div className="chart-month" key={item.month}>
        <div className="chart-columns">
          <div className="chart-bar chart-income" style={{ height: `${item.entradas / maxValue * 100}%` }} title={`Entradas: ${moeda(item.entradas)}`} />
          <div className="chart-bar chart-expense" style={{ height: `${item.despesas / maxValue * 100}%` }} title={`Despesas: ${moeda(item.despesas)}`} />
        </div><span className="month-label">{item.month}</span>
      </div>)}
    </div>
  </section>
}
export default MonthlyChart
