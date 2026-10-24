import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SummaryCard from '../components/SummaryCard'
import MonthlyChart from '../components/MonthlyChart'
import GoalCard from '../components/GoalCard'
import RecentTransactions from '../components/RecentTransactions'
import Topbar from '../components/Topbar'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../contexts/ThemeContext'
import { listarRegistros, type Registro } from '../services/registros'
import { listarCofres, type Cofre } from '../services/cofres'
import './Dashboard.css'

const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function Dashboard() {
  // O layout começa no tema claro; o botão permite alternar durante o uso.
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [animatedArrow, setAnimatedArrow] = useState<'income' | 'expense' | null>(null)
  const [search, setSearch] = useState('')
  const [registros, setRegistros] = useState<Registro[]>([])
  const [cofres, setCofres] = useState<Cofre[]>([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    setErro('')
    const [registrosResult, cofresResult] = await Promise.allSettled([listarRegistros(), listarCofres()])
    if (registrosResult.status === 'fulfilled') setRegistros(registrosResult.value)
    else setErro(registrosResult.reason instanceof Error ? registrosResult.reason.message : 'Não foi possível carregar os registros.')
    if (cofresResult.status === 'fulfilled') setCofres(cofresResult.value)
    setCarregando(false)
  }, [])

  useEffect(() => { void carregarDados() }, [carregarDados])

  useEffect(() => {
    const tipoAdicionado = (location.state as { registroAdicionado?: string } | null)?.registroAdicionado
    if (tipoAdicionado !== 'GANHO' && tipoAdicionado !== 'GASTO') return

    setAnimatedArrow(tipoAdicionado === 'GANHO' ? 'income' : 'expense')
    const timeout = window.setTimeout(() => setAnimatedArrow(null), 950)
    return () => window.clearTimeout(timeout)
  }, [location.state])

  const resumo = useMemo(() => {
    const entradas = registros.filter((r) => r.tipoRegistro === 'GANHO').reduce((s, r) => s + Number(r.valor), 0)
    const despesas = registros.filter((r) => r.tipoRegistro === 'GASTO').reduce((s, r) => s + Number(r.valor), 0)
    const guardado = cofres.reduce((s, c) => s + Number(c.valorAtual ?? 0), 0)
    return { entradas, despesas, saldo: entradas - despesas, guardado }
  }, [registros, cofres])

  const hoje = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())
  const totalMovimentado = resumo.entradas + resumo.despesas
  const percentualEntradas = totalMovimentado > 0 ? (resumo.entradas / totalMovimentado) * 100 : 0

  return <div className={`dashboard-layout${isDark ? ' dark' : ''}`}>
    <Sidebar />
    <main className="dashboard-content" id="topo">
      <Topbar onSearch={setSearch} />
      <header className="dashboard-header">
        <div className="dashboard-welcome"><h1>Olá!</h1><p>Aqui está um resumo da sua vida financeira.</p></div>
        <div className="dashboard-header-actions"><ThemeToggle isDark={isDark} onToggle={toggleTheme} /><div className="dashboard-date"><span aria-hidden="true">▦</span> Hoje, {hoje}</div></div>
      </header>

      {erro && <div className="dashboard-alert" role="alert">{erro} <button onClick={() => void carregarDados()}>Tentar novamente</button></div>}
      {carregando && <p className="loading-message">Carregando seus dados financeiros…</p>}

      <section className="summary-grid" aria-label="Resumo financeiro">
        <SummaryCard title="Saldo atual" value={moeda(resumo.saldo)} description="Entradas menos despesas" icon="▣" tone="green" />
        <SummaryCard title="Entradas" value={moeda(resumo.entradas)} description="Total de ganhos cadastrados" icon="↑" tone="green" animation={animatedArrow === 'income' ? 'income' : undefined} />
        <SummaryCard title="Despesas" value={moeda(resumo.despesas)} description="Total de gastos cadastrados" icon="↓" tone="red" animation={animatedArrow === 'expense' ? 'expense' : undefined} />
        <SummaryCard title="Cofres" value={moeda(resumo.guardado)} description={`${cofres.length} ${cofres.length === 1 ? 'meta ativa' : 'metas ativas'}`} icon="◎" tone="green" />
      </section>

      <section className="dashboard-main-grid">
        <MonthlyChart registros={registros} />
        <section className="goals-panel" id="cofres">
          <div className="section-heading"><div><h2>Cofres e metas</h2><p>Acompanhe o progresso dos seus objetivos</p></div><Link to="/cofres" className="text-link">Ver todos →</Link></div>
          {cofres.length ? <div className="goals-list">{cofres.slice(0, 3).map((cofre) => <GoalCard key={cofre.id} name={cofre.nome} current={Number(cofre.valorAtual ?? 0)} target={Number(cofre.meta)} />)}</div> : <div className="empty-card">{carregando ? 'Carregando cofres…' : 'Você ainda não tem cofres cadastrados.'}</div>}
        </section>
        <aside className="habit-card">
          <div className="habit-illustration" aria-hidden="true">🌱</div>
          <h2>Pequenos hábitos<br />fazem grandes sonhos.</h2>
          <p>Organize suas finanças hoje e construa o futuro que você quer.</p>
          <Link to="/registros/novo" className="primary-action">Adicionar registro</Link>
        </aside>
      </section>

      <section className="dashboard-bottom-grid" id="transacoes">
        <RecentTransactions registros={registros} search={search} />
        <section className="distribution-card" id="distribuicao">
          <div className="section-heading"><div><h2>Distribuição financeira</h2><p>Proporção entre entradas e despesas</p></div></div>
          {totalMovimentado > 0 ? <div className="distribution-content">
            <div className="donut-chart" style={{ background: `conic-gradient(#16a34a 0 ${percentualEntradas}%, #3b82f6 ${percentualEntradas}% 100%)` }}><div className="donut-hole"><strong>100%</strong><span>movimentado</span></div></div>
            <div className="distribution-legend"><div><i className="legend-dot income-dot"/><span>Entradas</span><strong>{totalMovimentado ? Math.round(percentualEntradas) : 0}%</strong></div><div><i className="legend-dot expense-dot"/><span>Despesas</span><strong>{totalMovimentado ? Math.round(100 - percentualEntradas) : 0}%</strong></div></div>
          </div> : <div className="distribution-empty">Cadastre entradas e despesas para visualizar sua distribuição financeira.</div>}
        </section>
      </section>

      <section className="motivation-banner"><div className="banner-plant" aria-hidden="true">🌱</div><div><h2>Seus objetivos importam!</h2><p>Continue firme. Cada pequena conquista aproxima você dos seus sonhos.</p></div>      <Link to="/cofres" className="secondary-action">Ver cofres</Link><span className="banner-arrow" aria-hidden="true">›</span></section>    </main>
  </div>
}

export default Dashboard
