import Sidebar from "../components/Sidebar"
import SummaryCard from "../components/SummaryCard"
import MonthlyChart from "../components/MonthlyChart"
import GoalCard from "../components/GoalCard"
import RecentTransactions from "../components/RecentTransactions"  
import './Dashboard.css'
import {useState} from 'react'
import ThemeToggle from "../components/ThemeToggle"

function Dashboard(){
    const [isDark, setIsDark] = useState(false)

   

    return (
       <div className={`dashboard-layout${isDark ? ' dark' : ''}`}>
        <Sidebar />

        <main className="dashboard-content">
            <header className="dashboard-header">
                <div>
                    <h1>Visão geral</h1>
                    <p>Acompanhe sua vida financeira de forma simples e eficiente.</p>
                </div>
                <ThemeToggle
                    isDark={isDark}
                    onToggle={() => setIsDark(!isDark)}
                />
            </header>
           
            <section className="suammary-grid">
                <SummaryCard
                    title="Saldo atual"
                    value="R$ 1.000,00"
                    description="Saldo disponível em conta"
                
                />
                <SummaryCard
                    title="Entradas"
                    value="R$ 3.500,00"
                    description="Total recebido"
                />

                <SummaryCard
                    title="Despesas"
                    value="R$ 1.050,00"
                    description="Total gasto"
                />

                <SummaryCard
                    title="Cofres"
                    value="R$ 800,00"
                    description="Total guardado"
                />
            </section>
            <MonthlyChart />
            
                <section className="dashboard-lower-grid">
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

            <RecentTransactions />
        </section>

        </main>
       </div>
    )
}
export default Dashboard