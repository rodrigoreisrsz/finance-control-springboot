import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useTheme } from '../contexts/ThemeContext'
import { criarRegistro, type TipoRegistro } from '../services/registros'
import './NewRegistro.css'

function NewRegistro() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [tipo, setTipo] = useState<TipoRegistro>('GANHO')
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState(new Date().toLocaleDateString('en-CA'))
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setSucesso(false)

    const valorNumerico = Number(valor.replace(',', '.'))
    if (!nome.trim()) {
      setErro('Digite um nome para identificar este registro.')
      return
    }
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setErro('Informe um valor maior que zero.')
      return
    }
    if (!data) {
      setErro('Escolha a data do registro.')
      return
    }

    setSalvando(true)
    try {
      await criarRegistro({
        nome: nome.trim(),
        valor: valorNumerico,
        data,
        descricao: descricao.trim(),
        tipoRegistro: tipo,
      })
      setSucesso(true)
      window.setTimeout(() => navigate('/dashboard', { state: { registroAdicionado: tipo } }), 650)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o registro.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className={`dashboard-layout new-registro-layout${isDark ? ' dark' : ''}`}>
      <Sidebar />
      <main className="dashboard-content new-registro-content">
        <header className="new-registro-topline page-stagger page-stagger-1">
          <div>
            <Link to="/dashboard" className="back-link">← Voltar ao painel</Link>
            <p className="new-registro-eyebrow">MOVIMENTAÇÃO FINANCEIRA</p>
            <h1>Adicionar registro</h1>
            <p className="new-registro-intro">Registre uma entrada ou despesa e mantenha suas finanças em dia.</p>
          </div>
          <div className="new-registro-top-icon" aria-hidden="true">＋</div>
        </header>

        <div className="new-registro-columns page-stagger page-stagger-2">
          <section className="new-registro-form-card">
            <div className="new-registro-step"><span>1</span><div><h2>Que tipo de registro?</h2><p>Escolha uma opção para continuar.</p></div></div>

            <div className="registro-type-options" role="group" aria-label="Tipo de registro">
              <button type="button" className={`registro-type-option income-option${tipo === 'GANHO' ? ' selected' : ''}`} aria-pressed={tipo === 'GANHO'} onClick={() => setTipo('GANHO')}>
                <span className="registro-option-icon">↙</span>
                <span className="registro-option-copy"><strong>Entrada</strong><small>Dinheiro que você recebeu</small></span>
                <span className="registro-option-check">{tipo === 'GANHO' ? '✓' : '+'}</span>
              </button>
              <button type="button" className={`registro-type-option expense-option${tipo === 'GASTO' ? ' selected' : ''}`} aria-pressed={tipo === 'GASTO'} onClick={() => setTipo('GASTO')}>
                <span className="registro-option-icon">↗</span>
                <span className="registro-option-copy"><strong>Despesa</strong><small>Dinheiro que você gastou</small></span>
                <span className="registro-option-check">{tipo === 'GASTO' ? '✓' : '+'}</span>
              </button>
            </div>

            <div className="new-registro-step form-step"><span>2</span><div><h2>Detalhes do registro</h2><p>Preencha as informações abaixo.</p></div></div>

            <form className="new-registro-form" onSubmit={handleSubmit}>
              <label htmlFor="registro-nome">Nome do registro <span>*</span></label>
              <input id="registro-nome" value={nome} onChange={(event) => setNome(event.target.value)} placeholder={tipo === 'GANHO' ? 'Ex.: Salário, freelance...' : 'Ex.: Mercado, aluguel...'} maxLength={100} required />

              <div className="registro-form-row">
                <div className="registro-field">
                  <label htmlFor="registro-valor">Valor (R$) <span>*</span></label>
                  <div className="registro-money-input"><span>R$</span><input id="registro-valor" inputMode="decimal" value={valor} onChange={(event) => setValor(event.target.value.replace(/[^0-9.,]/g, ''))} placeholder="0,00" required /></div>
                </div>
                <div className="registro-field">
                  <label htmlFor="registro-data">Data <span>*</span></label>
                  <input id="registro-data" type="date" value={data} onChange={(event) => setData(event.target.value)} required />
                </div>
              </div>

              <label htmlFor="registro-descricao">Descrição <small>(opcional)</small></label>
              <textarea id="registro-descricao" value={descricao} onChange={(event) => setDescricao(event.target.value)} placeholder="Adicione uma observação para lembrar depois..." rows={3} maxLength={300} />

              {erro && <div className="registro-feedback error-feedback" role="alert">{erro}</div>}
              {sucesso && <div className="registro-feedback success-feedback" role="status">✓ Registro salvo! Voltando ao painel...</div>}

              <div className="registro-form-actions">
                <Link to="/dashboard" className="registro-cancel-button">Cancelar</Link>
                <button className={`registro-submit-button ${tipo === 'GASTO' ? 'submit-expense' : ''}`} type="submit" disabled={salvando || sucesso}>
                  {salvando ? 'Salvando...' : sucesso ? 'Salvo ✓' : 'Salvar registro →'}
                </button>
              </div>
            </form>
          </section>

          <aside className={`registro-preview-card ${tipo === 'GASTO' ? 'preview-expense' : ''}`}>
            <div className="preview-card-top"><span className="preview-dot" /> PRÉVIA DO REGISTRO</div>
            <div className="preview-icon">{tipo === 'GANHO' ? '↙' : '↗'}</div>
            <p className="preview-type-label">{tipo === 'GANHO' ? 'Entrada selecionada' : 'Despesa selecionada'}</p>
            <h2>{nome.trim() || (tipo === 'GANHO' ? 'Sua nova entrada' : 'Sua nova despesa')}</h2>
            <strong className="preview-amount">{tipo === 'GASTO' ? '− ' : '+ '}{(Number(valor.replace(',', '.')) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            <div className="preview-divider" />
            <div className="preview-detail"><span>Data</span><strong>{data ? new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR') : 'Não definida'}</strong></div>
            <div className="preview-detail"><span>Categoria</span><strong>{tipo === 'GANHO' ? 'Entrada' : 'Despesa'}</strong></div>
            <p className="preview-tip">{tipo === 'GANHO' ? '✨ Cada entrada é um passo para seus objetivos.' : '💡 Acompanhar despesas ajuda você a cuidar do seu dinheiro.'}</p>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default NewRegistro
