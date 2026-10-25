import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import Topbar from '../components/Topbar'
import AnimatedNumber from '../components/AnimatedNumber'
import { useTheme } from '../contexts/ThemeContext'
import { buscarPerfil, type AccountProfile } from '../services/account'
import {
  getProfilePhoto,
  prepararFotoPerfil,
  removeProfilePhoto,
  saveProfilePhoto,
  setCurrentAccountId,
} from '../services/profilePhoto'
import {
  exportarRelatorio,
  type ReportExportData,
  type ReportFormat,
} from '../services/reportsExport'
import { listarRegistros, type Registro } from '../services/registros'
import './ConfiguracoesPage.css'

type PeriodOption =
  | 'current-month'
  | 'previous-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'current-year'
  | 'previous-year'
  | 'all-time'
  | 'custom'

interface DateRange {
  startDate: string | null
  endDate: string | null
  label: string
}

const dataIso = (data: Date) => {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

const dataBr = (data: string) => {
  const [ano, mes, dia] = data.split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}

const validarData = (data: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false
  const [ano, mes, dia] = data.split('-').map(Number)
  const dataParsed = new Date(ano, mes - 1, dia)
  return dataParsed.getFullYear() === ano
    && dataParsed.getMonth() === mes - 1
    && dataParsed.getDate() === dia
}

function calcularPeriodo(
  periodo: PeriodOption,
  inicioCustom: string,
  fimCustom: string,
  hoje = new Date(),
): DateRange | null {
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()
  const hojeIso = dataIso(hoje)
  let inicio: Date
  let fim: Date

  switch (periodo) {
    case 'current-month':
      inicio = new Date(ano, mes, 1)
      fim = hoje
      break
    case 'previous-month':
      inicio = new Date(ano, mes - 1, 1)
      fim = new Date(ano, mes, 0)
      break
    case 'last-3-months':
      inicio = new Date(ano, mes - 2, 1)
      fim = hoje
      break
    case 'last-6-months':
      inicio = new Date(ano, mes - 5, 1)
      fim = hoje
      break
    case 'current-year':
      inicio = new Date(ano, 0, 1)
      fim = hoje
      break
    case 'previous-year':
      inicio = new Date(ano - 1, 0, 1)
      fim = new Date(ano - 1, 11, 31)
      break
    case 'all-time':
      return {
        startDate: null,
        endDate: null,
        label: 'Todo o histórico disponível',
      }
    case 'custom':
      if (!validarData(inicioCustom) || !validarData(fimCustom) || inicioCustom > fimCustom) return null
      return {
        startDate: inicioCustom,
        endDate: fimCustom,
        label: `${dataBr(inicioCustom)} a ${dataBr(fimCustom)}`,
      }
  }

  const inicioIso = dataIso(inicio)
  const fimIso = dataIso(fim)
  if (fimIso > hojeIso) return null

  return {
    startDate: inicioIso,
    endDate: fimIso,
    label: `${dataBr(inicioIso)} a ${dataBr(fimIso)}`,
  }
}

const valorSeguro = (valor: number | string | null | undefined) => {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : 0
}

function ConfiguracoesPage() {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [, setSearch] = useState('')
  const [perfil, setPerfil] = useState<AccountProfile | null>(null)
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null)
  const [processandoFoto, setProcessandoFoto] = useState(false)
  const [erroFoto, setErroFoto] = useState('')
  const inputFotoRef = useRef<HTMLInputElement>(null)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroPerfil, setErroPerfil] = useState('')
  const [erroRegistros, setErroRegistros] = useState('')
  const [formato, setFormato] = useState<ReportFormat>('pdf')
  const [periodo, setPeriodo] = useState<PeriodOption>('current-month')
  const [inicioCustom, setInicioCustom] = useState('')
  const [fimCustom, setFimCustom] = useState('')
  const [exportando, setExportando] = useState(false)
  const [erroExportacao, setErroExportacao] = useState('')
  const [sucessoExportacao, setSucessoExportacao] = useState('')

  useEffect(() => {
    let ativo = true

    void Promise.allSettled([buscarPerfil(), listarRegistros()]).then(([perfilResultado, registrosResultado]) => {
      if (!ativo) return

      if (perfilResultado.status === 'fulfilled') {
        setPerfil(perfilResultado.value)
        setCurrentAccountId(perfilResultado.value.id)
        setFotoPerfil(getProfilePhoto(perfilResultado.value.id))
      } else {
        setErroPerfil(perfilResultado.reason instanceof Error
          ? perfilResultado.reason.message
          : 'Não foi possível carregar os dados da conta.')
      }

      if (registrosResultado.status === 'fulfilled') {
        setRegistros(registrosResultado.value)
      } else {
        setErroRegistros(registrosResultado.reason instanceof Error
          ? registrosResultado.reason.message
          : 'Não foi possível carregar os registros financeiros.')
      }

      setCarregando(false)
    })

    return () => {
      ativo = false
    }
  }, [])

  const intervalo = calcularPeriodo(periodo, inicioCustom, fimCustom)

  const registrosDoPeriodo = useMemo(() => {
    if (!intervalo) return []
    return registros
      .filter((registro) => {
        if (!validarData(registro.data)) return false
        return (!intervalo.startDate || registro.data >= intervalo.startDate)
          && (!intervalo.endDate || registro.data <= intervalo.endDate)
      })
      .sort((a, b) => a.data.localeCompare(b.data) || a.id - b.id)
  }, [intervalo, registros])

  const resumo = useMemo(() => {
    const entradas = registrosDoPeriodo
      .filter((registro) => registro.tipoRegistro === 'GANHO')
      .reduce((soma, registro) => soma + valorSeguro(registro.valor), 0)
    const despesas = registrosDoPeriodo
      .filter((registro) => registro.tipoRegistro === 'GASTO')
      .reduce((soma, registro) => soma + valorSeguro(registro.valor), 0)
    return { entradas, despesas, saldo: entradas - despesas }
  }, [registrosDoPeriodo])

  const relatorio = useMemo<ReportExportData | null>(() => {
    if (!intervalo) return null
    return {
      periodLabel: intervalo.label,
      startDate: intervalo.startDate,
      endDate: intervalo.endDate,
      records: registrosDoPeriodo,
      totals: {
        income: resumo.entradas,
        expenses: resumo.despesas,
        balance: resumo.saldo,
      },
    }
  }, [intervalo, registrosDoPeriodo, resumo])

  const sair = () => {
    sessionStorage.removeItem('jwt')
    setCurrentAccountId(null)
    navigate('/login', { replace: true })
  }

  const selecionarFoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0]
    event.target.value = ''
    if (!arquivo || !perfil) return

    setErroFoto('')
    setProcessandoFoto(true)
    try {
      const foto = await prepararFotoPerfil(arquivo)
      saveProfilePhoto(perfil.id, foto)
      setFotoPerfil(foto)
    } catch (error) {
      setErroFoto(error instanceof Error ? error.message : 'Não foi possível salvar a foto.')
    } finally {
      setProcessandoFoto(false)
    }
  }

  const removerFoto = () => {
    if (!perfil) return
    removeProfilePhoto(perfil.id)
    setFotoPerfil(null)
    setErroFoto('')
  }

  const iniciarExportacao = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErroExportacao('')
    setSucessoExportacao('')

    if (!relatorio) {
      setErroExportacao('Informe um período válido para exportar.')
      return
    }

    setExportando(true)
    try {
      await exportarRelatorio(formato, relatorio)
      setSucessoExportacao(`Relatório ${formato.toUpperCase()} gerado e baixado com sucesso.`)
    } catch (error) {
      setErroExportacao(error instanceof Error
        ? error.message
        : 'Não foi possível gerar o arquivo do relatório.')
    } finally {
      setExportando(false)
    }
  }

  const customInvalido = periodo === 'custom' && (
    !validarData(inicioCustom)
    || !validarData(fimCustom)
    || inicioCustom > fimCustom
  )

  return (
    <div className={`dashboard-layout settings-layout${isDark ? ' dark' : ''}`}>
      <Sidebar />
      <main className="dashboard-content settings-page-content">
        <Topbar onSearch={setSearch} />

        <header className="settings-header page-stagger page-stagger-1">
          <div>
            <p className="eyebrow">Conta e preferências</p>
            <h1>Perfil e Configurações</h1>
            <p>Gerencie sua conta e exporte seus relatórios financeiros.</p>
          </div>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </header>

        <section className="settings-section page-stagger page-stagger-2">
          <div className="settings-section-heading">
            <div>
              <p className="eyebrow">Minha conta</p>
              <h2>Dados do perfil</h2>
            </div>
          </div>

          {erroPerfil && <div className="settings-alert error" role="alert">{erroPerfil}</div>}
          {carregando ? (
            <div className="settings-empty">Carregando perfil…</div>
          ) : perfil ? (
            <div className="profile-details">
              <div className="profile-photo-control">
                <div className="profile-avatar-large">
                  {fotoPerfil
                    ? <img src={fotoPerfil} alt={`Foto de perfil de ${perfil.name}`} />
                    : <span aria-hidden="true">{perfil.name.trim().charAt(0).toLocaleUpperCase('pt-BR')}</span>}
                </div>
                <div className="profile-photo-actions">
                  <input
                    ref={inputFotoRef}
                    className="profile-photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => void selecionarFoto(event)}
                    aria-label="Selecionar foto de perfil"
                  />
                  <button
                    type="button"
                    className="settings-secondary-button profile-photo-button"
                    onClick={() => inputFotoRef.current?.click()}
                    disabled={processandoFoto}
                  >
                    {processandoFoto ? 'Processando foto…' : fotoPerfil ? 'Alterar foto' : 'Adicionar foto'}
                  </button>
                  {fotoPerfil && (
                    <button type="button" className="profile-remove-photo" onClick={removerFoto}>
                      Remover
                    </button>
                  )}
                </div>
                <small className="profile-photo-hint">JPG, PNG ou WebP · máximo 8 MB</small>
              </div>
              <div className="profile-detail">
                <span>Nome</span>
                <strong>{perfil.name}</strong>
              </div>
              <div className="profile-detail">
                <span>E-mail</span>
                <strong>{perfil.email}</strong>
              </div>
              <button type="button" className="settings-secondary-button" onClick={sair}>Sair da conta</button>
            </div>
          ) : (
            <div className="settings-empty">Os dados da conta não estão disponíveis.</div>
          )}
          {erroFoto && <div className="settings-alert error profile-photo-error" role="alert">{erroFoto}</div>}
        </section>

        <section className="settings-section export-section page-stagger page-stagger-3">
          <div className="settings-section-heading">
            <div>
              <p className="eyebrow">Seus dados</p>
              <h2>Exportar relatórios</h2>
              <p>Baixe uma cópia das suas movimentações e do resumo financeiro do período.</p>
            </div>
          </div>

          {erroRegistros && <div className="settings-alert error" role="alert">{erroRegistros}</div>}

          <form className="export-form" onSubmit={iniciarExportacao}>
            <fieldset className="format-fieldset">
              <legend>Formato do arquivo</legend>
              <div className="format-options">
                {([
                  { value: 'pdf', title: 'PDF', description: 'Relatório pronto para leitura e impressão' },
                  { value: 'csv', title: 'CSV', description: 'Arquivo simples para programas de planilha' },
                  { value: 'xlsx', title: 'Excel', description: 'Planilha com abas de resumo e movimentações' },
                ] as const).map((option) => (
                  <label key={option.value} className={`format-option${formato === option.value ? ' selected' : ''}`}>
                    <input
                      type="radio"
                      name="formato"
                      value={option.value}
                      checked={formato === option.value}
                      onChange={() => setFormato(option.value)}
                    />
                    <span className="format-option-content">
                      <strong>{option.title}</strong>
                      <small>{option.description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="settings-field">
              Período do relatório
              <select value={periodo} onChange={(event) => setPeriodo(event.target.value as PeriodOption)}>
                <option value="current-month">Mês atual</option>
                <option value="previous-month">Mês anterior</option>
                <option value="last-3-months">Últimos 3 meses</option>
                <option value="last-6-months">Últimos 6 meses</option>
                <option value="current-year">Ano atual</option>
                <option value="previous-year">Ano anterior</option>
                <option value="all-time">Todo o histórico disponível</option>
                <option value="custom">Período personalizado</option>
              </select>
            </label>

            {periodo === 'custom' && (
              <div className="custom-date-fields">
                <label className="settings-field">
                  Data inicial
                  <input type="date" value={inicioCustom} onChange={(event) => setInicioCustom(event.target.value)} required />
                </label>
                <label className="settings-field">
                  Data final
                  <input type="date" value={fimCustom} onChange={(event) => setFimCustom(event.target.value)} required />
                </label>
              </div>
            )}

            {customInvalido && periodo === 'custom' && inicioCustom && fimCustom && inicioCustom > fimCustom && (
              <div className="settings-alert error" role="alert">A data inicial não pode ser posterior à data final.</div>
            )}

            {intervalo && (
              <div className="export-preview" aria-live="polite">
                <div className="export-preview-heading">
                  <div>
                    <span>Prévia do período</span>
                    <strong>{intervalo.label}</strong>
                  </div>
                  <small>
                    {erroRegistros
                      ? 'Dados indisponíveis'
                      : carregando
                        ? 'Atualizando dados…'
                        : <><AnimatedNumber value={registrosDoPeriodo.length} format="integer" /> movimentações</>}
                  </small>
                </div>
                {carregando ? (
                  <p className="export-preview-error">A prévia será exibida quando os registros forem carregados.</p>
                ) : erroRegistros ? (
                  <p className="export-preview-error">A prévia não está disponível enquanto os registros não forem carregados.</p>
                ) : (
                  <div className="export-preview-totals">
                    <div><span>Entradas</span><strong><AnimatedNumber value={resumo.entradas} /></strong></div>
                    <div><span>Despesas</span><strong><AnimatedNumber value={resumo.despesas} /></strong></div>
                    <div><span>Saldo</span><strong><AnimatedNumber value={resumo.saldo} /></strong></div>
                  </div>
                )}
              </div>
            )}

            <p className="export-note">
              O modelo atual não possui categoria financeira nos registros; os arquivos incluirão somente os campos disponíveis.
            </p>

            {erroExportacao && <div className="settings-alert error" role="alert">{erroExportacao}</div>}
            {sucessoExportacao && <div className="settings-alert success" role="status">{sucessoExportacao}</div>}

            <button
              type="submit"
              className="settings-primary-button"
              disabled={carregando || Boolean(erroRegistros) || exportando || customInvalido || !relatorio}
            >
              {exportando ? 'Gerando relatório…' : 'Exportar relatório'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default ConfiguracoesPage
