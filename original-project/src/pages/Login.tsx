
import { useState } from 'react'
import type { FormEvent } from 'react'
import { login } from '../services/authService'
import './Login.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const registrationSuccess = Boolean((location.state as { registrationSuccess?: boolean } | null)?.registrationSuccess)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const user = await login({ email, password })

      sessionStorage.setItem('jwt', user.jwt)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro inesperado.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <h1>Meu Financeiro</h1>

        <div className="login-brand-content">
          <div className="login-brand-copy">
            <span className="login-eyebrow">CONTROLE FINANCEIRO SIMPLES</span>
            <h2>Sua vida financeira, <span>mais leve.</span></h2>
            <p>
              Organize seus gastos, acompanhe suas metas e tenha
              mais controle sobre seu dinheiro.
            </p>
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
                    <div><span>Receitas</span><b>R$ 5.200</b><i className="mock-bar green" /></div>
                    <div><span>Despesas</span><b>R$ 2.150</b><i className="mock-bar blue" /></div>
                  </div>
                  <div className="mock-lower">
                  <div className="mock-chart">
                  <strong>Fluxo mensal</strong>

                  <div className="mock-chart-lines">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="mock-chart-bars">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                    <div className="mock-goals"><strong>Metas</strong><div className="goal-line"><i/><span/></div><div className="goal-line second"><i/><span/></div><div className="goal-line third"><i/><span/></div></div>
                  </div>
                </div>
              </div>
              <div className="laptop-base"><span /></div>
            </div>
            <div className="phone-float">
              <div className="phone-frame"><div className="phone-notch"/><div className="phone-ui">
                <div className="phone-greeting">Olá, Rodrigo <span>✦</span></div><small>Saldo disponível</small><b className="phone-balance">R$ 8.450,00</b>
                <div className="phone-change">↗ 12,8% este mês</div>
                <div className="phone-mini-title">Resumo do mês</div><div className="phone-mini-cards"><div><i>↙</i><small>Receitas</small><b>R$ 5.200</b></div><div><i>↗</i><small>Despesas</small><b>R$ 2.150</b></div></div>
                <div className="phone-mini-title">Minhas metas <span>Ver todas</span></div><div className="phone-goal"><div><span>Viagem</span><b>68%</b></div><i><em/></i></div><div className="phone-goal"><div><span>Novo notebook</span><b>42%</b></div><i><em/></i></div>
                <div className="phone-nav"><i>⌂</i><i>▥</i><i>◎</i><i>☰</i></div>
              </div></div>
            </div>
            <div className="floating-chip"><span>↗</span><div><b>Seu dinheiro</b><small>sob controle</small></div></div>
          </div>
        </div>
      </section>

      <section className="login-form-section">
        <div className="login-form-container">
          <h2>Bem-vindo de volta!</h2>
          <p>Entre na sua conta para continuar.</p>
          {registrationSuccess && <p className="auth-success" role="status">Conta criada com sucesso! Faça login para continuar.</p>}

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <p role="alert">{error}</p>}

            <a className="forgot-password" href="#">
              Esqueceu sua senha?
            </a>

            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="register-link">
            Ainda não tem uma conta? <Link to="/cadastro">Criar conta</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
