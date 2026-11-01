import { useEffect, useState, type FormEvent } from 'react'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import Topbar from '../components/Topbar'
import { useTheme } from '../contexts/ThemeContext'
import { categoriasRegistro, rotuloCategoria, type CategoriaRegistro } from '../services/categorias'
import {
  alterarStatusRecorrencia,
  criarRecorrencia,
  executarRecorrencia,
  excluirRecorrencia,
  listarRecorrencias,
  type Recorrencia,
} from '../services/recorrencias'
import type { TipoRegistro } from '../services/registros'
import './OrcamentosPage.css'
import './RecorrenciasPage.css'

const moeda = (valor: number | string) => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dataHoje = () => {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
}

function dataBr(data: string): string {
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR')
}

function RecorrenciasPage() {
  const { isDark, toggleTheme } = useTheme()
  const [, setSearch] = useState('')
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([])
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<TipoRegistro>('GASTO')
  const [categoria, setCategoria] = useState<CategoriaRegistro>('OUTROS')
  const [diaDoMes, setDiaDoMes] = useState(String(new Date().getDate()))
  const [dataInicio, setDataInicio] = useState(dataHoje)
  const [confirmacaoObrigatoria, setConfirmacaoObrigatoria] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [acaoId, setAcaoId] = useState<number | null>(null)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function carregarRecorrencias() {
    setRecorrencias(await listarRecorrencias())
  }

  useEffect(() => {
    let ativo = true
    void listarRecorrencias()
      .then((dados) => { if (ativo) setRecorrencias(dados) })
      .catch((error: unknown) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar as recorrências.')
      })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setSucesso('')
    const valorNumerico = Number(valor.replace(',', '.'))
    const dia = Number(diaDoMes)
    if (!nome.trim()) {
      setErro('Informe o nome do lançamento.')
      return
    }
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setErro('Informe um valor maior que zero.')
      return
    }
    if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
      setErro('Escolha um dia entre 1 e 31.')
      return
    }

    setSalvando(true)
    try {
      await criarRecorrencia({
        nome: nome.trim(),
        valor: valorNumerico,
        descricao: descricao.trim(),
        tipoRegistro: tipo,
        categoria,
        diaDoMes: dia,
        dataInicio,
        confirmacaoObrigatoria,
      })
      await carregarRecorrencias()
      setNome('')
      setValor('')
      setDescricao('')
      setSucesso('Lançamento recorrente criado.')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível criar o lançamento recorrente.')
    } finally {
      setSalvando(false)
    }
  }

  async function alterarStatus(item: Recorrencia) {
    setErro('')
    setAcaoId(item.id)
    try {
      const atualizado = await alterarStatusRecorrencia(item.id, !item.ativa)
      setRecorrencias((atuais) => atuais.map((recorrencia) => recorrencia.id === item.id ? atualizado : recorrencia))
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível atualizar o lançamento recorrente.')
    } finally {
      setAcaoId(null)
    }
  }

  async function revisarLancamento(item: Recorrencia) {
    setErro('')
    setAcaoId(item.id)
    try {
      await executarRecorrencia(item.id)
      await carregarRecorrencias()
      setSucesso(`Lançamento "${item.nome}" adicionado aos registros.`)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível confirmar o lançamento.')
    } finally {
      setAcaoId(null)
    }
  }

  async function remover(item: Recorrencia) {
    if (!window.confirm(`Excluir a recorrência "${item.nome}"? Os registros já criados serão mantidos.`)) return
    setErro('')
    setAcaoId(item.id)
    try {
      await excluirRecorrencia(item.id)
      setRecorrencias((atuais) => atuais.filter((recorrencia) => recorrencia.id !== item.id))
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível excluir o lançamento recorrente.')
    } finally {
      setAcaoId(null)
    }
  }

  return (
    <div className={`dashboard-layout recurring-layout${isDark ? ' dark' : ''}`}>
      <Sidebar />
      <main className="dashboard-content feature-page-content">
        <Topbar onSearch={setSearch} />
        <header className="feature-page-header">
          <div>
            <p className="eyebrow eyebrow-green">Automação financeira</p>
            <h1>Lançamentos recorrentes</h1>
            <p className="subtitle">Programe despesas e receitas mensais sem perder o controle dos próximos lançamentos.</p>
          </div>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </header>

        <div className="recurring-columns">
          <section className="feature-form-card recurring-form-card">
            <div>
              <h2>Novo lançamento mensal</h2>
              <p>O dia 29, 30 ou 31 será ajustado ao último dia de meses mais curtos.</p>
            </div>
            <form className="recurring-form" onSubmit={handleSubmit}>
              <div className="recurring-type-picker" role="group" aria-label="Tipo do lançamento">
                <button type="button" className={tipo === 'GASTO' ? 'selected expense' : ''} aria-pressed={tipo === 'GASTO'} onClick={() => { setTipo('GASTO'); setCategoria('OUTROS') }}>Despesa</button>
                <button type="button" className={tipo === 'GANHO' ? 'selected income' : ''} aria-pressed={tipo === 'GANHO'} onClick={() => { setTipo('GANHO'); setCategoria('RECEITAS') }}>Receita</button>
              </div>
              <label>Nome
                <input value={nome} onChange={(event) => setNome(event.target.value)} maxLength={100} placeholder="Ex.: Aluguel, salário..." required />
              </label>
              <div className="recurring-form-row">
                <label>Valor (R$)
                  <input inputMode="decimal" value={valor} onChange={(event) => setValor(event.target.value.replace(/[^0-9.,]/g, ''))} placeholder="0,00" required />
                </label>
                <label>Categoria
                  <select value={categoria} onChange={(event) => setCategoria(event.target.value as CategoriaRegistro)}>
                    {categoriasRegistro.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
              </div>
              <div className="recurring-form-row">
                <label>Dia do mês
                  <input type="number" min={1} max={31} value={diaDoMes} onChange={(event) => setDiaDoMes(event.target.value)} required />
                </label>
                <label>Começar em
                  <input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} required />
                </label>
              </div>
              <label>Descrição <span className="optional-label">(opcional)</span>
                <textarea value={descricao} onChange={(event) => setDescricao(event.target.value)} rows={2} maxLength={300} placeholder="Detalhes que aparecerão nos registros" />
              </label>
              <label className="recurring-review-option">
                <input type="checkbox" checked={confirmacaoObrigatoria} onChange={(event) => setConfirmacaoObrigatoria(event.target.checked)} />
                <span><strong>Revisar antes de lançar</strong><small>Você confirma cada ocorrência quando ela vencer.</small></span>
              </label>
              {erro && <p className="feature-feedback feature-error" role="alert">{erro}</p>}
              {sucesso && <p className="feature-feedback feature-success" role="status">{sucesso}</p>}
              <button className="recurring-submit" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Criar recorrência'}</button>
            </form>
          </section>

          <section className="recurring-list-section">
            <div className="recurring-list-heading">
              <div><h2>Programações</h2><p>{recorrencias.filter((item) => item.ativa).length} ativas</p></div>
            </div>
            {carregando ? (
              <p className="feature-state">Carregando recorrências...</p>
            ) : recorrencias.length === 0 ? (
              <div className="recurring-empty"><span aria-hidden="true">↻</span><strong>Nenhuma recorrência ainda</strong><p>Crie uma programação para automatizar seus lançamentos mensais.</p></div>
            ) : (
              <div className="recurring-list">
                {recorrencias.map((item) => (
                  <article className={`recurring-card${!item.ativa ? ' paused' : ''}`} key={item.id}>
                    <div className="recurring-card-main">
                      <span className={`recurring-type-icon ${item.tipoRegistro === 'GASTO' ? 'expense' : 'income'}`} aria-hidden="true">{item.tipoRegistro === 'GASTO' ? '↗' : '↙'}</span>
                      <div className="recurring-card-title"><h3>{item.nome}</h3><span>{rotuloCategoria(item.categoria)} · todo dia {item.diaDoMes}</span></div>
                      <strong className={item.tipoRegistro === 'GASTO' ? 'expense-amount' : 'income-amount'}>{moeda(item.valor)}</strong>
                    </div>
                    <div className="recurring-card-meta">
                      <span>{item.ativa ? (item.aguardandoRevisao ? 'Aguardando sua revisão' : `Próximo: ${dataBr(item.proximaExecucao)}`) : 'Pausada'}</span>
                      <span>{item.confirmacaoObrigatoria ? 'Revisão manual' : 'Lançamento automático'}</span>
                    </div>
                    <div className="recurring-card-actions">
                      {item.aguardandoRevisao && (
                        <button type="button" className="recurring-confirm" disabled={acaoId === item.id} onClick={() => void revisarLancamento(item)}>
                          {acaoId === item.id ? 'Lançando...' : 'Revisar e lançar'}
                        </button>
                      )}
                      <button type="button" disabled={acaoId === item.id} onClick={() => void alterarStatus(item)}>{item.ativa ? 'Pausar' : 'Ativar'}</button>
                      <button type="button" className="recurring-remove" disabled={acaoId === item.id} onClick={() => void remover(item)}>Excluir</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default RecorrenciasPage
