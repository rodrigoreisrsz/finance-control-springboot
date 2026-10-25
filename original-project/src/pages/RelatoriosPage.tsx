import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import Topbar from '../components/Topbar'
import AnimatedNumber from '../components/AnimatedNumber'
import { useTheme } from '../contexts/ThemeContext'
import { listarRegistros, type Registro } from '../services/registros'
import './RelatoriosPage.css'

const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const valorSeguro = (valor: number | string | null | undefined) => {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : 0
}

const formatarMes = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)

const inferCategoria = (texto: string) => {
  const valor = texto.toLowerCase()

  if (/(aluguel|imovel|condominio|casa|moradia|iptu|prestacao)/.test(valor)) return 'Moradia'
  if (/(mercado|supermercado|alimentacao|comida|padaria|restaurante|lanches|delivery|cafe)/.test(valor)) return 'Alimentação'
  if (/(transporte|onibus|uber|combustivel|gasolina|carro|metro|taxi|estacionamento)/.test(valor)) return 'Transporte'
  if (/(saude|medico|farmacia|consulta|hospital|dentista|remedio)/.test(valor)) return 'Saúde'
  if (/(estudo|curso|escola|faculdade|livro|ensino)/.test(valor)) return 'Educação'
  if (/(lazer|cinema|streaming|jogo|viagem|turismo|entretenimento)/.test(valor)) return 'Lazer'
  if (/(salario|bonus|freela|rendimento|ganho|reembolso|venda)/.test(valor)) return 'Receitas'
  return 'Outros'
}

function RelatoriosPage() {
  const { isDark, toggleTheme } = useTheme()
  const [, setSearch] = useState('')
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [mesSelecionado, setMesSelecionado] = useState(() => new Date())
  const [mesTooltip, setMesTooltip] = useState<number | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const dados = await listarRegistros()
        setRegistros(dados)
      } catch (error) {
        setErro(error instanceof Error ? error.message : 'Não foi possível carregar os registros.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const navegarMes = (passo: number) => {
    setMesSelecionado((atual) => new Date(atual.getFullYear(), atual.getMonth() + passo, 1))
  }

  const periodoAtual = useMemo(() => new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth(), 1), [mesSelecionado])
  const mesesHistorico = useMemo(() => {
    const resultado = [] as Array<{ label: string; year: number; month: number; entradas: number; despesas: number }>
    const base = new Date(periodoAtual.getFullYear(), periodoAtual.getMonth(), 1)

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(base.getFullYear(), base.getMonth() - index, 1)
      const items = registros.filter((registro) => {
        const dataRegistro = new Date(`${registro.data}T12:00:00`)
        return dataRegistro.getFullYear() === date.getFullYear() && dataRegistro.getMonth() === date.getMonth()
      })

      resultado.push({
        label: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', ''),
        year: date.getFullYear(),
        month: date.getMonth(),
        entradas: items.filter((registro) => registro.tipoRegistro === 'GANHO').reduce((soma, registro) => soma + valorSeguro(registro.valor), 0),
        despesas: items.filter((registro) => registro.tipoRegistro === 'GASTO').reduce((soma, registro) => soma + valorSeguro(registro.valor), 0),
      })
    }

    return resultado
  }, [periodoAtual, registros])

  const registrosDoMes = useMemo(() => {
    const inicio = new Date(periodoAtual.getFullYear(), periodoAtual.getMonth(), 1)
    const fim = new Date(periodoAtual.getFullYear(), periodoAtual.getMonth() + 1, 0, 23, 59, 59)

    return registros.filter((registro) => {
      const data = new Date(`${registro.data}T12:00:00`)
      return data >= inicio && data <= fim
    })
  }, [periodoAtual, registros])

  const totalEntradas = useMemo(
    () => registrosDoMes.filter((registro) => registro.tipoRegistro === 'GANHO').reduce((soma, registro) => soma + valorSeguro(registro.valor), 0),
    [registrosDoMes],
  )

  const totalDespesas = useMemo(
    () => registrosDoMes.filter((registro) => registro.tipoRegistro === 'GASTO').reduce((soma, registro) => soma + valorSeguro(registro.valor), 0),
    [registrosDoMes],
  )

  const saldoPeriodo = totalEntradas - totalDespesas

  const categoriaGastos = useMemo(() => {
    const mapa = new Map<string, number>()
    const despesas = registrosDoMes.filter((registro) => registro.tipoRegistro === 'GASTO')

    despesas.forEach((registro) => {
      const categoria = inferCategoria(`${registro.nome} ${registro.descricao}`)
      mapa.set(categoria, (mapa.get(categoria) ?? 0) + valorSeguro(registro.valor))
    })

    return [...mapa.entries()].sort(([, valorA], [, valorB]) => valorB - valorA)
  }, [registrosDoMes])

  const maiorCategoria = categoriaGastos[0]
  const maiorCategoriaShare = totalDespesas > 0 ? (Number(maiorCategoria?.[1] ?? 0) / totalDespesas) * 100 : 0

  const valorAnterior = useMemo(() => {
    const mesAntes = new Date(periodoAtual.getFullYear(), periodoAtual.getMonth() - 1, 1)
    const inicio = new Date(mesAntes.getFullYear(), mesAntes.getMonth(), 1)
    const fim = new Date(mesAntes.getFullYear(), mesAntes.getMonth() + 1, 0, 23, 59, 59)

    const itens = registros.filter((registro) => {
      const data = new Date(`${registro.data}T12:00:00`)
      return data >= inicio && data <= fim
    })

    return itens.filter((registro) => registro.tipoRegistro === 'GANHO').reduce((soma, registro) => soma + valorSeguro(registro.valor), 0)
      - itens.filter((registro) => registro.tipoRegistro === 'GASTO').reduce((soma, registro) => soma + valorSeguro(registro.valor), 0)
  }, [periodoAtual, registros])

  const variacaoPeriodo = valorAnterior === 0 ? 0 : ((saldoPeriodo - valorAnterior) / Math.abs(valorAnterior)) * 100

  const maxValue = Math.max(1, ...mesesHistorico.flatMap((item) => [item.entradas, item.despesas]))
  const chartWidth = 680
  const chartHeight = 300
  const plotTop = 20
  const plotBottom = 238
  const plotLeft = 56
  const plotRight = 660
  const points = mesesHistorico.map((item, index) => {
    const x = plotLeft + ((plotRight - plotLeft) / (mesesHistorico.length - 1)) * index
    const yEntradas = plotBottom - (item.entradas / maxValue) * (plotBottom - plotTop)
    const yDespesas = plotBottom - (item.despesas / maxValue) * (plotBottom - plotTop)
    return { ...item, x, yEntradas, yDespesas }
  })

  const criarCurva = (serie: 'yEntradas' | 'yDespesas') => {
    if (points.length === 0) return ''
    return points.slice(0, -1).reduce((path, point, index) => {
      const proximo = points[index + 1]
      const anterior = points[Math.max(0, index - 1)]
      const seguinte = points[Math.min(points.length - 1, index + 2)]
      const inicioY = point[serie]
      const fimY = proximo[serie]
      const limiteMin = Math.min(inicioY, fimY)
      const limiteMax = Math.max(inicioY, fimY)
      const controle1Y = Math.min(limiteMax, Math.max(limiteMin, inicioY + (fimY - anterior[serie]) / 6))
      const controle2Y = Math.min(limiteMax, Math.max(limiteMin, fimY - (seguinte[serie] - inicioY) / 6))
      return `${path} C ${point.x + (proximo.x - point.x) / 3} ${controle1Y}, ${proximo.x - (proximo.x - point.x) / 3} ${controle2Y}, ${proximo.x} ${fimY}`
    }, `M ${points[0].x} ${points[0][serie]}`)
  }

  const criarArea = (serie: 'yEntradas' | 'yDespesas') =>
    `${criarCurva(serie)} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`
  const areaEntradas = criarArea('yEntradas')
  const areaDespesas = criarArea('yDespesas')
  const chartAnimationKey = `${periodoAtual.getTime()}:${mesesHistorico.map((item) => `${item.entradas}-${item.despesas}`).join('|')}`

  const insights = useMemo(() => {
    const itens = [] as string[]

    if (registrosDoMes.length === 0) {
      return ['Nenhum registro encontrado para este período. Cadastre ganhos ou gastos para gerar o resumo.']
    }

    if (totalDespesas > 0 && maiorCategoria) {
      itens.push(`A categoria ${maiorCategoria[0]} concentra ${maiorCategoriaShare.toFixed(0)}% das despesas do período.`)
    }

    if (variacaoPeriodo > 0) {
      itens.push(`Seu saldo melhorou ${Math.abs(variacaoPeriodo).toFixed(1)}% em comparação com o mês anterior.`)
    } else if (variacaoPeriodo < 0) {
      itens.push(`Seu saldo caiu ${Math.abs(variacaoPeriodo).toFixed(1)}% em comparação com o mês anterior.`)
    } else {
      itens.push('Seu saldo permaneceu estável em comparação ao mês anterior.')
    }

    if (totalEntradas > 0 && totalDespesas > 0) {
      itens.push(`Você manteve um saldo positivo de ${moeda(saldoPeriodo)} no período selecionado.`)
    } else if (saldoPeriodo < 0) {
      itens.push(`Este mês ficou com déficit de ${moeda(Math.abs(saldoPeriodo))}. Uma revisão de gastos recorrentes pode ajudar.`)
    }

    if (itens.length < 3) {
      itens.push('Continue acompanhando os indicadores mensais para identificar tendências de consumo e melhoria de saldo.')
    }

    return itens.slice(0, 3)
  }, [maiorCategoria, maiorCategoriaShare, registrosDoMes.length, saldoPeriodo, totalDespesas, totalEntradas, variacaoPeriodo])

  const monthValue = `${mesSelecionado.getFullYear()}-${String(mesSelecionado.getMonth() + 1).padStart(2, '0')}`

  return (
    <div className={`dashboard-layout relatorios-layout${isDark ? ' dark' : ''}`}>
      <Sidebar />
      <main className="dashboard-content relatorios-page-content">
        <Topbar onSearch={setSearch} />

        <header className="relatorios-header page-stagger page-stagger-1">
          <div>
            <p className="eyebrow eyebrow-green">Relatórios</p>
            <h1>Relatórios</h1>
            <p className="subtitle">Analise sua movimentação financeira e descubra oportunidades de economizar.</p>
          </div>

          <div className="relatorios-header-actions">
            <button type="button" className="ghost-button" onClick={() => navegarMes(-1)}>← Mês anterior</button>
            <input
              type="month"
              className="month-picker"
              value={monthValue}
              onChange={(event) => {
                const [year, month] = event.target.value.split('-').map(Number)
                if (year && month) {
                  setMesSelecionado(new Date(year, month - 1, 1))
                }
              }}
            />
            <button type="button" className="ghost-button" onClick={() => navegarMes(1)}>Próximo mês →</button>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </header>

        {erro && <div className="panel-alert error" role="alert">{erro}</div>}
        {loading ? <div className="empty-state">Carregando relatórios…</div> : (
          <>
            <section className="summary-grid relatorios-summary-grid">
              <article className="summary-card page-stagger page-stagger-1">
                <span className="summary-card-label">Total de entradas</span>
                <strong><AnimatedNumber value={totalEntradas} /></strong>
                <small>{formatarMes(periodoAtual)}</small>
              </article>

              <article className="summary-card page-stagger page-stagger-2">
                <span className="summary-card-label">Total de despesas</span>
                <strong><AnimatedNumber value={totalDespesas} /></strong>
                <small>{formatarMes(periodoAtual)}</small>
              </article>

              <article className="summary-card positive page-stagger page-stagger-3">
                <span className="summary-card-label">Saldo do período</span>
                <strong><AnimatedNumber value={saldoPeriodo} /></strong>
                <small>{saldoPeriodo >= 0 ? 'Resultado positivo' : 'Resultado negativo'}</small>
              </article>
            </section>

            <section className="relatorios-main-grid page-stagger page-stagger-3">
              <div className="panel-card chart-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Evolução</p>
                    <h2>Entradas x despesas</h2>
                  </div>
                  <p className="panel-subtitle">6 meses até {formatarMes(periodoAtual)}</p>
                </div>

                <div className="chart-legend">
                  <span><i className="legend-dot income-dot" /> Entradas</span>
                  <span><i className="legend-dot expense-dot" /> Despesas</span>
                </div>

                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="area-chart" preserveAspectRatio="none" role="group" aria-label={`Evolução mensal de entradas e despesas, ${formatarMes(new Date(mesesHistorico[0].year, mesesHistorico[0].month, 1))} a ${formatarMes(periodoAtual)}`}>
                  <defs>
                    <linearGradient id="income-area-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#20c997" stopOpacity=".48" />
                      <stop offset="100%" stopColor="#20c997" stopOpacity=".06" />
                    </linearGradient>
                    <linearGradient id="expense-area-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity=".48" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity=".06" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3].map((index) => {
                    const y = plotTop + ((plotBottom - plotTop) / 3) * index
                    const labelValue = maxValue * (1 - index / 3)
                    return (
                      <g key={index} className="chart-grid-row">
                        <line x1={plotLeft} x2={plotRight} y1={y} y2={y} />
                        <text x={plotLeft - 10} y={y + 4} textAnchor="end">{moeda(labelValue)}</text>
                      </g>
                    )
                  })}
                  <g key={chartAnimationKey} className="area-chart-series">
                    <path d={areaEntradas} className="chart-area chart-area-income" />
                    <path d={areaDespesas} className="chart-area chart-area-expense" />
                    <path d={criarCurva('yEntradas')} className="chart-curve chart-curve-income" />
                    <path d={criarCurva('yDespesas')} className="chart-curve chart-curve-expense" />
                  </g>
                  {points.map((point) => (
                    <g
                      key={`${point.year}-${point.month}`}
                      className="chart-month-point"
                      tabIndex={0}
                      role="button"
                      aria-label={`${formatarMes(new Date(point.year, point.month, 1))}. Entradas: ${moeda(point.entradas)}. Despesas: ${moeda(point.despesas)}.`}
                      onMouseEnter={() => setMesTooltip(point.month + point.year * 12)}
                      onMouseLeave={() => setMesTooltip(null)}
                      onFocus={() => setMesTooltip(point.month + point.year * 12)}
                      onBlur={() => setMesTooltip(null)}
                      onPointerDown={() => setMesTooltip(point.month + point.year * 12)}
                    >
                      <circle cx={point.x} cy={point.yEntradas} r={14} className="chart-touch-target" />
                      <circle cx={point.x} cy={point.yDespesas} r={14} className="chart-touch-target" />
                      <circle cx={point.x} cy={point.yEntradas} r={4} className="chart-point-income" />
                      <circle cx={point.x} cy={point.yDespesas} r={4} className="chart-point-expense" />
                      <text x={point.x} y={chartHeight - 14} textAnchor="middle" className="chart-month-label">{point.label}</text>
                      {mesTooltip === point.month + point.year * 12 && (
                        <g className="chart-tooltip" aria-hidden="true">
                          <rect x={Math.min(Math.max(point.x - 96, plotLeft), plotRight - 192)} y={Math.max(plotTop, Math.min(point.yEntradas, point.yDespesas) - 72)} width={192} height={62} rx={9} />
                          <text x={Math.min(Math.max(point.x - 84, plotLeft + 12), plotRight - 180)} y={Math.max(plotTop + 20, Math.min(point.yEntradas, point.yDespesas) - 48)} className="chart-tooltip-month">{formatarMes(new Date(point.year, point.month, 1))}</text>
                          <text x={Math.min(Math.max(point.x - 84, plotLeft + 12), plotRight - 180)} y={Math.max(plotTop + 39, Math.min(point.yEntradas, point.yDespesas) - 29)} className="chart-tooltip-income">Entradas: {moeda(point.entradas)}</text>
                          <text x={Math.min(Math.max(point.x - 84, plotLeft + 12), plotRight - 180)} y={Math.max(plotTop + 56, Math.min(point.yEntradas, point.yDespesas) - 12)} className="chart-tooltip-expense">Despesas: {moeda(point.despesas)}</text>
                        </g>
                      )}
                    </g>
                  ))}
                </svg>
              </div>

              <aside className="panel-card insights-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Resumo</p>
                    <h2>Insights do período</h2>
                  </div>
                </div>

                <div className="insights-list">
                  {insights.map((insight) => (
                    <div key={insight} className="insight-item">
                      <span className="insight-bullet">✦</span>
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </section>

            <section className="relatorios-bottom-grid page-stagger page-stagger-4">
              <div className="panel-card categories-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Distribuição</p>
                    <h2>Despesas por categoria</h2>
                  </div>
                </div>

                {categoriaGastos.length === 0 ? (
                  <div className="empty-state">Nenhuma despesa registrada para o período.</div>
                ) : (
                  <div className="category-list">
                    {categoriaGastos.slice(0, 5).map(([categoria, valor]) => {
                      const percentual = totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0
                      return (
                        <div key={`${categoria}-${valor}`} className="category-item">
                          <div className="category-row">
                            <span>{categoria}</span>
                            <strong><AnimatedNumber value={valor} /></strong>
                          </div>
                          <div className="category-bar">
                            <span className="chart-progress-enter" style={{ width: `${percentual}%` }} />
                          </div>
                          <small><AnimatedNumber value={percentual} format="percent" /> do total</small>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="panel-card comparison-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Comparação</p>
                    <h2>Variação no saldo</h2>
                  </div>
                </div>

                <div className="comparison-summary">
                  <strong><AnimatedNumber value={Number.isFinite(variacaoPeriodo) ? variacaoPeriodo : 0} format="percent" decimals={1} /></strong>
                  <span>em relação ao mês anterior</span>
                </div>

                <div className="comparison-mini">
                  <div>
                    <label>Mês atual</label>
                    <strong><AnimatedNumber value={saldoPeriodo} /></strong>
                  </div>
                  <div>
                    <label>Mês anterior</label>
                    <strong><AnimatedNumber value={valorAnterior} /></strong>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default RelatoriosPage
