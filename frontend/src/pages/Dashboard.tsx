import Sidebar from "../components/Sidebar"
import './Dashboard.css'

function Dashboard(){
    return (
       <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-content">
            <h1>Finance Control</h1>
            <p>Bem-vindo ao seu controle financeiro!</p>
        </main>
       </div>
    )
}
export default Dashboard