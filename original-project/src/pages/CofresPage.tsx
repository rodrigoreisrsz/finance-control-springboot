import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import Topbar from '../components/Topbar'
import AnimatedNumber from '../components/AnimatedNumber'
import { useTheme } from '../contexts/ThemeContext'
import {
  criarAporte,
  criarCofre,
  editarCofre,
  excluirCofre,
  listarAportes,
  listarCofres,
  type Aporte,
  type Cofre,
} from '../services/cofres'
import './CofresPage.css'

const formatarData = (data: string | null | undefined) => {
  if (!data) return 'Data indisponível'
  const [ano, mes, dia] = data.split('-')
  if (!ano || !mes || !dia) return data
  return `${dia}/${mes}/${ano}`
}

function CofresPage() {
  const { isDark, toggleTheme } = useTheme()
  const [cofres, setCofres] = useState<Cofre[]>([])
  const [search, setSearch] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [feedback, setFeedback] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAporteModal, setShowAporteModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedCofre, setSelectedCofre] = useState<Cofre | null>(null)
  const [historicoAportes, setHistoricoAportes] = useState<Aporte[]>([])
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)

  const [nome, setNome] = useState('')
  const [meta, setMeta] = useState('')
  const [deposito, setDeposito] = useState('')
  const [valorAporte, setValorAporte] = useState('')
  const [dataAporte, setDataAporte] = useState(() => new Date().toISOString().slice(0, 10))
  const [salvando, setSalvando] = useState(false)

  const carregarCofres = async () => {
    setCarregando(true)
    setErro('')
    try {
      const dados = await listarCofres()
      setCofres(dados)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar os cofres.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarCofres()
  }, [])

  const filteredCofres = useMemo(() => {
    const termo = search.trim().toLowerCase()
    if (!termo) return cofres
    return cofres.filter((cofre) => cofre.nome.toLowerCase().includes(termo))
  }, [cofres, search])

  const totalGuardado = useMemo(
    () => cofres.reduce((soma, cofre) => soma + Number(cofre.valorAtual ?? 0), 0),
    [cofres],
  )
  const totalMeta = useMemo(
    () => cofres.reduce((soma, cofre) => soma + Number(cofre.meta ?? 0), 0),
    [cofres],
  )
  const progressoGeral = totalMeta > 0 ? Math.min((totalGuardado / totalMeta) * 100, 100) : 0

  const abrirFormularioCriacao = () => {
    setEditingId(null)
    setNome('')
    setMeta('')
    setDeposito('')
    setShowCreateModal(true)
  }

  const abrirFormularioEdicao = (cofre: Cofre) => {
    setEditingId(cofre.id)
    setNome(cofre.nome)
    setMeta(String(cofre.meta ?? ''))
    setDeposito('')
    setShowCreateModal(true)
  }

  const fecharModalCriacao = () => {
    setShowCreateModal(false)
    setEditingId(null)
    setNome('')
    setMeta('')
    setDeposito('')
  }

  const abrirModalAporte = (cofre: Cofre) => {
    setSelectedCofre(cofre)
    setValorAporte('')
    setDataAporte(new Date().toISOString().slice(0, 10))
    setShowAporteModal(true)
  }

  const fecharModalAporte = () => {
    setShowAporteModal(false)
    setSelectedCofre(null)
    setValorAporte('')
  }

  const abrirModalHistorico = async (cofre: Cofre) => {
    setSelectedCofre(cofre)
    setShowHistoryModal(true)
    setCarregandoHistorico(true)

    try {
      const dados = await listarAportes()
      const doCofre = dados.filter((aporte) => Number(aporte.cofre?.id ?? 0) === cofre.id)
      setHistoricoAportes(doCofre)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar o histórico do cofre.')
      setHistoricoAportes([])
    } finally {
      setCarregandoHistorico(false)
    }
  }

  const fecharModalHistorico = () => {
    setShowHistoryModal(false)
    setSelectedCofre(null)
    setHistoricoAportes([])
  }

  const salvarCofre = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro('')
    setFeedback('')

    const nomeLimpo = nome.trim()
    const metaNumerica = Number(meta.replace(',', '.'))
    const depositoNumerico = deposito ? Number(deposito.replace(',', '.')) : 0

    if (!nomeLimpo) {
      setErro('Informe um nome para o cofre.')
      return
    }

    if (!Number.isFinite(metaNumerica) || metaNumerica <= 0) {
      setErro('Informe uma meta maior que zero.')
      return
    }

    if (deposito && (!Number.isFinite(depositoNumerico) || depositoNumerico < 0)) {
      setErro('O depósito inicial deve ser maior ou igual a zero.')
      return
    }

    setSalvando(true)

    try {
      if (editingId !== null) {
        await editarCofre(editingId, { nome: nomeLimpo, meta: metaNumerica })
        setFeedback('Cofre atualizado com sucesso!')
      } else {
        await criarCofre({ nome: nomeLimpo, meta: metaNumerica, deposito: depositoNumerico })
        setFeedback('Cofre criado com sucesso!')
      }
      fecharModalCriacao()
      await carregarCofres()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o cofre.')
    } finally {
      setSalvando(false)
    }
  }

  const salvarAporte = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedCofre) return

    const valorNumerico = Number(valorAporte.replace(',', '.'))
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setErro('Informe um valor de aporte maior que zero.')
      return
    }

    if (!dataAporte) {
      setErro('Informe a data do aporte.')
      return
    }

    setSalvando(true)
    setErro('')
    setFeedback('')

    try {
      await criarAporte({ cofreId: selectedCofre.id, valor: valorNumerico, data: dataAporte })
      setFeedback('Aporte registrado com sucesso!')
      fecharModalAporte()
      await carregarCofres()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível registrar o aporte.')
    } finally {
      setSalvando(false)
    }
  }

  const deletarCofre = async (cofre: Cofre) => {
    const confirmou = window.confirm(`Deseja excluir o cofre "${cofre.nome}"?`)
    if (!confirmou) return

    setErro('')
    setFeedback('')

    try {
      await excluirCofre(cofre.id)
      setFeedback('Cofre excluído com sucesso!')
      await carregarCofres()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível excluir o cofre.')
    }
  }

  return (
    <div className={`dashboard-layout cofres-layout${isDark ? ' dark' : ''}`}>
      <Sidebar />
      <main className="dashboard-content cofres-page-content">
        <Topbar onSearch={setSearch} />

        <header className="cofres-header page-stagger page-stagger-1">
          <div>
            <h1>Cofres e Metas</h1>
            <p>Organize seus objetivos e acompanhe sua evolução financeira.</p>
          </div>

          <div className="cofres-header-actions">
            <button type="button" className="ghost-button" onClick={() => {
              const alvo = selectedCofre ?? cofres[0]
              if (alvo) abrirModalHistorico(alvo)
            }} disabled={cofres.length === 0}>
              Ver histórico
            </button>
            <button type="button" className="primary-button" onClick={abrirFormularioCriacao}>
              + Criar cofre
            </button>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </header>

        {erro && <div className="panel-alert error" role="alert">{erro}</div>}
        {feedback && <div className="panel-alert success" role="status">{feedback}</div>}

        <section className="cofres-summary">
          <article className="summary-tile page-stagger page-stagger-1">
            <div className="summary-header">
              <span className="summary-icon green">◍</span>
              <span className="summary-label">Total guardado</span>
            </div>
            <strong><AnimatedNumber value={totalGuardado} /></strong>
            <small>de <AnimatedNumber value={totalMeta || 0} /></small>
          </article>

          <article className="summary-tile progress-tile page-stagger page-stagger-2">
            <div className="summary-header">
              <span className="summary-icon green">◔</span>
              <span className="summary-label">Progresso geral</span>
            </div>
            <div key={progressoGeral} className="summary-ring chart-reveal" style={{ background: `conic-gradient(#20c997 ${progressoGeral}%, rgba(148,163,184,.28) 0)` }}>
              <span><AnimatedNumber value={Math.round(progressoGeral)} format="percent" /></span>
            </div>
            <small><AnimatedNumber value={totalGuardado} /> / <AnimatedNumber value={totalMeta || 0} /></small>
          </article>

          <article className="summary-tile page-stagger page-stagger-3">
            <div className="summary-header">
              <span className="summary-icon green">◎</span>
              <span className="summary-label">Cofres ativos</span>
            </div>
            <strong><AnimatedNumber value={cofres.length} format="integer" /></strong>
            <small>{cofres.length === 1 ? 'cofre criado' : 'cofres criados'}</small>
          </article>
        </section>

        <section className="cofres-main page-stagger page-stagger-3">
          <div className="cofres-list-section">
            <div className="section-title-row">
              <h2>Seus cofres e metas</h2>
            </div>

            {carregando ? (
              <div className="empty-state">Carregando cofres…</div>
            ) : filteredCofres.length === 0 ? (
              <div className="empty-state">Nenhum cofre encontrado. Comece criando sua primeira meta.</div>
            ) : (
              <div className="cofres-grid">
                {filteredCofres.map((cofre) => {
                  const atual = Number(cofre.valorAtual ?? 0)
                  const metaValor = Number(cofre.meta ?? 0)
                  const restante = Math.max(metaValor - atual, 0)
                  const percentual = metaValor > 0 ? Math.min((atual / metaValor) * 100, 100) : 0

                  return (
                    <article key={cofre.id} className="goal-card-item">
                      <div className="goal-card-top">
                        <div className="goal-card-icon">◎</div>
                        <button type="button" className="goal-menu-button" aria-label={`Ações do cofre ${cofre.nome}`}>
                          ⋯
                        </button>
                      </div>

                      <div className="goal-card-actions">
                        <button type="button" onClick={() => abrirModalAporte(cofre)}>Adicionar aporte</button>
                        <button type="button" onClick={() => abrirFormularioEdicao(cofre)}>Editar</button>
                        <button type="button" onClick={() => abrirModalHistorico(cofre)}>Histórico</button>
                        <button type="button" className="danger" onClick={() => deletarCofre(cofre)}>Excluir</button>
                      </div>

                      <h3>{cofre.nome}</h3>

                      <div className="goal-card-values">
                        <span>Guardado</span>
                        <strong><AnimatedNumber value={atual} /></strong>
                        <small>Meta <AnimatedNumber value={metaValor} /></small>
                      </div>

                      <div className="goal-progress-track" role="progressbar" aria-label={`Progresso do cofre ${cofre.nome}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percentual)}>
                        <div className="goal-progress-fill goal-progress-enter" style={{ width: `${percentual}%` }} />
                      </div>

                      <div className="goal-card-footer">
                        <span><AnimatedNumber value={Math.round(percentual)} format="percent" /></span>
                        <span>{restante > 0 ? <>Faltam <AnimatedNumber value={restante} /></> : 'Meta alcançada'}</span>
                      </div>

                      <div className="goal-card-meta">
                        <span>Meta</span>
                        <strong><AnimatedNumber value={metaValor} /></strong>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <aside className="goal-side-card">
            <div className="side-card-illustration" aria-hidden="true">🌱</div>
            <h3>Grandes sonhos começam com pequenos passos!</h3>
            <p>Continue poupando e construindo o futuro que você quer.</p>
            <button type="button" className="primary-button" onClick={abrirFormularioCriacao}>+ Criar cofre</button>
          </aside>
        </section>
      </main>

      {showCreateModal && (
        <div className="modal-backdrop" onClick={fecharModalCriacao}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">{editingId !== null ? 'Editar cofre' : 'Novo cofre'}</p>
                <h3>{editingId !== null ? 'Atualizar objetivo' : 'Criar novo cofre'}</h3>
              </div>
              <button type="button" className="close-button" onClick={fecharModalCriacao} aria-label="Fechar modal">×</button>
            </div>

            <form onSubmit={salvarCofre} className="cofre-form">
              <label>
                Nome do cofre
                <input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex.: Comprar um iPhone" maxLength={80} required />
              </label>

              <label>
                Meta (R$)
                <input value={meta} onChange={(event) => setMeta(event.target.value.replace(/[^0-9.,]/g, ''))} placeholder="5000,00" inputMode="decimal" required />
              </label>

              <label>
                Depósito inicial (opcional)
                <input value={deposito} onChange={(event) => setDeposito(event.target.value.replace(/[^0-9.,]/g, ''))} placeholder="250,00" inputMode="decimal" />
              </label>

              <div className="modal-actions">
                <button type="button" className="ghost-button" onClick={fecharModalCriacao}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={salvando}>
                  {salvando ? 'Salvando...' : editingId !== null ? 'Salvar alterações' : 'Criar cofre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAporteModal && selectedCofre && (
        <div className="modal-backdrop" onClick={fecharModalAporte}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Adicionar aporte</p>
                <h3>{selectedCofre.nome}</h3>
              </div>
              <button type="button" className="close-button" onClick={fecharModalAporte} aria-label="Fechar modal">×</button>
            </div>

            <form onSubmit={salvarAporte} className="cofre-form">
              <label>
                Valor do aporte (R$)
                <input value={valorAporte} onChange={(event) => setValorAporte(event.target.value.replace(/[^0-9.,]/g, ''))} placeholder="250,00" inputMode="decimal" required />
              </label>

              <label>
                Data do aporte
                <input type="date" value={dataAporte} onChange={(event) => setDataAporte(event.target.value)} required />
              </label>

              <div className="modal-actions">
                <button type="button" className="ghost-button" onClick={fecharModalAporte}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Adicionar aporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && selectedCofre && (
        <div className="modal-backdrop" onClick={fecharModalHistorico}>
          <div className="modal-card history-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Histórico</p>
                <h3>{selectedCofre.nome}</h3>
              </div>
              <button type="button" className="close-button" onClick={fecharModalHistorico} aria-label="Fechar histórico">×</button>
            </div>

            <div className="history-body">
              <p>O endpoint /cofre/aportes retorna todos os aportes do usuário e pode ser filtrado pelo cofre selecionado.</p>
              <div className="history-summary">
                <span>Valor atual</span>
                <strong><AnimatedNumber value={Number(selectedCofre.valorAtual ?? 0)} /></strong>
              </div>
              <div className="history-summary">
                <span>Meta</span>
                <strong><AnimatedNumber value={Number(selectedCofre.meta ?? 0)} /></strong>
              </div>

              {carregandoHistorico ? (
                <div className="empty-state">Carregando histórico…</div>
              ) : historicoAportes.length === 0 ? (
                <div className="empty-state">Nenhum aporte registrado para este cofre.</div>
              ) : (
                <div className="history-list">
                  {historicoAportes.map((aporte) => (
                    <div key={aporte.id} className="history-entry">
                      <div>
                        <strong><AnimatedNumber value={Number(aporte.valor ?? 0)} /></strong>
                        <small>{formatarData(aporte.data)}</small>
                      </div>
                      <span>{aporte.cofre?.nome ?? selectedCofre.nome}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="primary-button" onClick={fecharModalHistorico}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {!showCreateModal && !showAporteModal && !showHistoryModal && (
        <Link to="/dashboard" className="floating-back-link">← Voltar ao dashboard</Link>
      )}
    </div>
  )
}

export default CofresPage
