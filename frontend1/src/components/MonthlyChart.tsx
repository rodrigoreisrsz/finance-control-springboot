import './MonthlyChart.css';

const monthlyData = [
    { month: 'Mai', entradas: 3200, despesas: 1800 },
    { month: 'Jun', entradas: 4000, despesas: 2200 },
    { month: 'Jul', entradas: 2800, despesas: 1900 },
    { month: 'Ago', entradas: 4500, despesas: 2500 },
    { month: 'Set', entradas: 3500, despesas: 2100 },
    { month: 'Out', entradas: 4800, despesas: 2700 },
]

function MontlyChart(){
    const maxValue = Math.max(
        ...monthlyData.map((data) => 
            Math.max(data.entradas, data.despesas)
    )
)
    return(
        <section className='monthly-chart'>
            <h2>Entradas x Despesas</h2>
            <p className='chart-subtitles'>
                Acompanhe sua movimentação mensal.
            </p>

            <div className="chart-legend">
                <span><i className="legend-income"/> Entradas</span>
                <span><i className="legend-expense" /> Despesas</span>
            </div>

            <div className="chart-bars">
                {monthlyData.map((item) => (
                    <div className="chart-month" key={item.month}>
                        <div className="chart-columns">
                            <div className="chart-bar chart-income"
                            style={{
                                height: `${(item.entradas / maxValue) * 100}%`,
                            }}
                            title={`Entradas: R$ ${item.entradas}`}
                            />
                            <div className="chart-bar chart-expense"
                            style={{
                                height: `${(item.despesas / maxValue) * 100}%`,
                            }}
                            title={`Despesas: R$ ${item.despesas}`}
                            />
                            </div>
                            <span className="month-label">{item.month}</span>
                        </div>

                ))}
            </div>
        </section>
    )
}
export default MontlyChart