import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import Topbar from '../components/Topbar'
import { useTheme } from '../contexts/ThemeContext'
import { categoriasOrcamento, obterCategoriaRegistro, rotuloCategoria, type CategoriaRegistro } from '../services/categorias'
import { excluirOrcamento, listarOrcamentos, salvarOrcamento, type Orcamento } from '../services/orcamentos'
import { listarRegistros, type Registro } from '../services/registros'
import './OrcamentosPage.css'

const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const valorSeguro = (valor: number | string | null | undefined) => {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : 0
}

function mesAtual(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

function OrcamentosPage() {
  const { isDark, toggleTheme } = useTheme()
  const [, setSearch] = useState('')
  const [mes, setMes] = useState(mesAtual)
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [categoria, setCategoria] = useState<CategoriaRegistro>('MORADIA')
  const [valor, setValor] = useState('')
  const [mesCarregado, setMesCarregado] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    void Promise.all([listarOrcamentos(mes), listarRegistros()])
      .then(([dadosOrcamentos, dadosRegistros]) => {
        if (!ativo) return
        setOrcamentos(dadosOrcamentos)
        setRegistros(dadosRegistros)
        setErro('')
      })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar os dados do período.')
      })
      .finally(() => {
        if (ativo) setMesCarregado(mes)
      })
    return () => { ativo = false }
  }, [mes])
  const carregando = mesCarregado !== mes

  const gastosPorCategoria = useMemo(() => {
    const gastos = new Map<CategoriaRegistro, number>()
    registros
      .filter((registro) => registro.tipoRegistro === 'GASTO' && registro.data.startsWith(mes))
      .forEach((registro) => {
        const categoriaRegistro = obterCategoriaRegistro(registro)
        gastos.set(categoriaRegistro, (gastos.get(categoriaRegistro) ?? 0) + valorSeguro(registro.valor))
      })
    return gastos
  }, [mes, registros])

  const orcamentosPorCategoria = useMemo(
    () => new Map(orcamentos.map((orcamento) => [orcamento.categoria, orcamento])),
    [orcamentos],
  )

  const totalOrcado = orcamentos.reduce((total, item) => total + valorSeguro(item.valor), 0)
  const totalGasto = [...gastosPorCategoria.values()].reduce((total, item) => total + item, 0)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setErro('')
    const valorNumerico = Number(valor.replace(',', '.'))
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setErro('Informe um limite mensal maior que zero.')
      return
    }

    setSalvando(true)
    try {
      await salvarOrcamento({ categoria, valor: valorNumerico, mes })
      setOrcamentos(await listarOrcamentos(mes))
      setValor('')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o orçamento.')
    } finally {
      setSalvando(false)
    }
  }

  async function removerOrcamento(id: number) {
    setErro('')
    try {
      await excluirOrcamento(id)
      setOrcamentos((atuais) => atuais.filter((item) => item.id !== id))
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível excluir o orçamento.')
    }
  }

  function editarOrcamento(item: Orcamento) {
    setCategoria(item.categoria)
    setValor(String(item.valor).replace('.', ','))
  }

  const mesFormatado = mes
    ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(`${mes}-01T12:00:00`))
    : ''

  return (
    <div className={`dashboard-layout orcamentos-layout${isDark ? ' dark' : ''}`}>
      <Sidebar />
      <main className="dashboard-content feature-page-content">
        <Topbar onSearch={setSearch} />
        <header className="feature-page-header">
          <div>
            <p className="eyebrow eyebrow-green">Planejamento financeiro</p>
            <h1>Orçamentos por categoria</h1>
            <p className="subtitle">Defina limites mensais e acompanhe seus gastos em cada categoria.</p>
          </div>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </header>

        <section className="budget-overview" aria-label="Resumo do mês">
          <div><span>Mês</span><strong>{mesFormatado}</strong></div>
          <div><span>Total orçado</span><strong>{moeda(totalOrcado)}</strong></div>
          <div><span>Total gasto</span><strong>{moeda(totalGasto)}</strong></div>
          <label className="budget-month-field">Período<input type="month" value={mes} onChange={(event) => setMes(event.target.value)} /></label>
        </section>

        <section className="feature-form-card">
          <div>
            <h2>Definir limite mensal</h2>
            <p>Salve um limite para cada categoria. Se já existir, o valor será atualizado.</p>
          </div>
          <form className="budget-form" onSubmit={handleSubmit}>
            <label>Categoria
              <select value={categoria} onChange={(event) => setCategoria(event.target.value as CategoriaRegistro)}>
                {categoriasOrcamento.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>Limite (R$)
              <input inputMode="decimal" value={valor} onChange={(event) => setValor(event.target.value.replace(/[^0-9.,]/g, ''))} placeholder="0,00" required />
            </label>
            <button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar limite'}</button>
          </form>
        </section>

        {erro && <p className="feature-feedback feature-error" role="alert">{erro}</p>}

        {carregando ? (
          <p className="feature-state">Carregando dados do mês...</p>
        ) : (
          <section className="budget-grid" aria-label="Gastos e limites por categoria">
            {categoriasOrcamento.map((item) => {
              const orcamento = orcamentosPorCategoria.get(item.value)
              const gasto = gastosPorCategoria.get(item.value) ?? 0
              const limite = orcamento ? valorSeguro(orcamento.valor) : 0
              const percentual = limite > 0 ? (gasto / limite) * 100 : 0
              return (
                <article className="budget-card" key={item.value}>
                  <div className="budget-card-title">
                    <div><span className="budget-category-icon" aria-hidden="true">◈</span><h2>{item.label}</h2></div>
                    {orcamento && <button className="budget-delete" type="button" onClick={() => void removerOrcamento(orcamento.id)} aria-label={`Remover limite de ${item.label}`}>×</button>}
                  </div>
                  <div className="budget-amounts">
                    <div><span>Gasto</span><strong>{moeda(gasto)}</strong></div>
                    <div><span>Limite</span><strong>{orcamento ? moeda(limite) : 'Não definido'}</strong></div>
                  </div>
                  {orcamento ? (
                    <>
                      <div className="budget-progress-track" role="progressbar" aria-label={`Uso do limite em ${item.label}`} aria-valuenow={Math.min(100, Math.round(percentual))} aria-valuemin={0} aria-valuemax={100}>
                        <span className={percentual >= 100 ? 'over-limit' : ''} style={{ width: `${Math.min(100, percentual)}%` }} />
                      </div>
                      <p className={`budget-status${percentual >= 100 ? ' over-limit-text' : ''}`}>
                        {percentual >= 100
                          ? `Limite excedido em ${moeda(gasto - limite)}`
                          : `Restam ${moeda(limite - gasto)} (${Math.round(percentual)}% utilizado)`}
                      </p>
                      <button type="button" className="budget-edit" onClick={() => editarOrcamento(orcamento)}>Editar limite</button>
                    </>
                  ) : (
                    <p className="budget-status">Sem limite definido para esta categoria.</p>
                  )}
                  {gasto > 0 && <span className="budget-spending-label">Movimentações classificadas como {rotuloCategoria(item.value)}.</span>}
                </article>
              )
            })}
          </section>
        )}
      </main>
    </div>
  )
}

export default OrcamentosPage
