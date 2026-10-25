import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import './Login.css'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
      navigate('/login', { replace: true, state: { registrationSuccess: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page register-page">
      <section className="login-brand page-stagger page-stagger-1">
        <h1>Meu Financeiro</h1>
        <div className="login-brand-content">
          <div className="login-brand-copy">
            <span className="login-eyebrow">COMECE A ORGANIZAR</span>
            <h2>Seu próximo passo para uma vida financeira <span>mais leve.</span></h2>
            <p>Crie sua conta, acompanhe seus gastos e transforme seus objetivos em metas possíveis.</p>
          </div>
          <div className="device-showcase" aria-label="Prévia do dashboard Meu Financeiro em um notebook e celular">
            <div className="device-glow" />
            <div className="laptop-float">
              <div className="laptop-screen">
                <div className="mock-dashboard">
                  <div className="mock-topbar"><span className="mock-logo"><i /> Meu Financeiro</span><span className="mock-avatar">R</span></div>
                  <div className="mock-heading">Visão geral <small>Seu resumo financeiro</small></div>
                  <div className="mock-stats">
                    <div><span>Saldo total</span><b>R$ 8.450,00</b><em>↗ 12,8%</em></div>
                    <div><span>Receitas</span><b>R$ 5.200</b><em>Este mês</em></div>
                    <div><span>Despesas</span><b>R$ 1.840</b><em>Este mês</em></div>
                  </div>
                  <div className="mock-panels"><div className="mock-chart"><b>Fluxo financeiro</b><div className="mock-bars"><i/><i/><i/><i/><i/><i/><i/></div></div><div className="mock-goal"><b>Meta do mês</b><strong>68%</strong><div><i/></div><small>R$ 3.400 de R$ 5.000</small></div></div>
                </div>
              </div>
              <div className="laptop-base" />
            </div>
            <div className="phone-float"><div className="phone-frame"><div className="phone-notch"/><div className="phone-content"><span>Meu Financeiro</span><small>Saldo disponível</small><b>R$ 8.450,00</b><div className="phone-mini-chart"><i/><i/><i/><i/><i/><i/></div><small>Meta de economia</small><strong>68%</strong><div className="phone-progress"><i/></div><div className="phone-transactions"><i/><span/><b>− R$ 85,90</b></div><div className="phone-transactions"><i/><span/><b>+ R$ 320,00</b></div></div></div></div>
          </div>
        </div>
        <div className="login-brand-footer"><span>CONTROLE</span><i /> <span>CLAREZA</span><i /> <span>TRANQUILIDADE</span></div>
      </section>

      <section className="login-form-section page-stagger page-stagger-2">
        <div className="login-form-container register-form-container">
          <span className="form-kicker">SUA JORNADA COMEÇA AQUI</span>
          <h2>Crie sua conta</h2>
          <p>Preencha os dados abaixo para começar a cuidar melhor do seu dinheiro.</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Nome completo</label>
            <input id="name" name="name" type="text" placeholder="Como podemos te chamar?" autoComplete="name" value={name} onChange={event => setName(event.target.value)} required maxLength={100} />
            <label htmlFor="register-email">E-mail</label>
            <input id="register-email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
            <label htmlFor="register-password">Senha</label>
            <input id="register-password" name="password" type="password" placeholder="Crie uma senha (mínimo 6 caracteres)" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required minLength={6} />
            <label htmlFor="confirm-password">Confirmar senha</label>
            <input id="confirm-password" name="confirmPassword" type="password" placeholder="Digite a senha novamente" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required minLength={6} />
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Criando conta...' : 'Criar minha conta'}</button>
          </form>
          <p className="register-link">Já tem uma conta? <Link to="/login">Entrar</Link></p>
        </div>
      </section>
    </main>
  )
}

export default Register
