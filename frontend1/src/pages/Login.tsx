
import { useState } from 'react'
import type { FormEvent } from 'react'
import { login } from '../services/authService'
import './Login.css'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
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
          <h2>Sua vida financeira, mais leve.</h2>
          <p>
            Organize seus gastos, acompanhe suas metas e tenha
            mais controle sobre seu dinheiro.
          </p>
        </div>
      </section>

      <section className="login-form-section">
        <div className="login-form-container">
          <h2>Bem-vindo de volta!</h2>
          <p>Entre na sua conta para continuar.</p>

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
            Ainda não tem uma conta? <a href="#">Criar conta</a>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
