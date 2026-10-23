
import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import SummaryCard from "../components/SummaryCard"
import MonthlyChart from "../components/MonthlyChart"
import GoalCard from "../components/GoalCard"
import RecentTransactions from "../components/RecentTransactions"
import ThemeToggle from "../components/ThemeToggle"
import Topbar from "../components/Topbar"
import { listarRegistros } from "../services/registros"
import "./Dashboard.css"

function Dashboard() {
  const [isDark, setIsDark] = useState(false)
  const [search, setSearch] = useState("")
  const [registros, setRegistros] = useState<unknown[]>([])
  const [erro, setErro] = useState("")

  useEffect(() => {
    async function carregarRegistros() {
      try {
        const dados = await listarRegistros()
        console.log("Registros recebidos da API:", dados)
        setRegistros(dados)
        setErro("")
      } catch (error) {
        console.error("Erro ao buscar registros:", error)
        setErro("Não foi possível carregar os registros.")
      }
    }

    carregarRegistros()
  }, [])

  return (
    <div className={`dashboard-layout${isDark ? " dark" : ""}`}>
      <Sidebar />

      <main className="dashboard-content">
        <Topbar onSearch={setSearch} />

        <header className="dashboard-header">
          <div>
            <h1>Visão geral</h1>
            <p>
              Acompanhe sua vida financeira de forma simples e eficiente.
            </p>
          </div>

              <div>
            <p>Registros carregados: {registros.length}</p>
            <ThemeToggle
              isDark={isDark}
              onToggle={() => setIsDark(!isDark)}
            />
          </div>
        </header>

        {erro && <p role="alert">{erro}</p>}

        <section className="summary-grid">
          
        <SummaryCard
            title="Saldo atual"
            value="R$ 1.000,00"
            description="Saldo disponível em conta"
            icon="R$"
            tone="green"
        />

        <SummaryCard
            title="Entradas"
            value="R$ 3.500,00"
            description="Total recebido"
            icon="↗"
            tone="blue"
        />

        <SummaryCard
            title="Despesas"
            value="R$ 1.050,00"
            description="Total gasto"
            icon="↘"
            tone="red"
        />

        <SummaryCard
            title="Cofres"
            value="R$ 800,00"
            description="Total guardado"
            icon="◈"
            tone="purple"
        />

        </section>

        <section className="dashboard-main-grid">
          <MonthlyChart />

          <section className="goals-section">
            <h2>Meus cofres</h2>

            <GoalCard
              name="Comprar um celular"
              current={800}
              target={2500}
            />

            <GoalCard
              name="Reserva de emergência"
              current={1500}
              target={5000}
            />
          </section>
        </section>

        <section className="dashboard-lower-grid">
          <RecentTransactions search={search} />
        </section>
      </main>
    </div>
  )
}

export default Dashboard
