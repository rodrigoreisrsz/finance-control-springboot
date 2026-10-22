import Sidebar from "../components/Sidebar"
import SummaryCard from "../components/SummaryCard"
import MonthlyChart from "../components/MonthlyChart"
import './Dashboard.css'

function Dashboard(){
    return (
       <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content">
            <header className="dashboard-reader">
                <div>
                    <h1>Visão geral</h1>
                    <p>Acompanhe sua vida financeira de forma simples e eficiente.</p>
                </div>
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
        </main>
       </div>
    )
}
export default Dashboard