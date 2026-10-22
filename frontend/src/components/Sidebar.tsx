import './Sidebar.css'
function Sidebar() {
    return(
        <aside className="sidebar"> 
            <h2>Meu financeiro</h2>

            <nav>
                <ul>
                    <li>Visão geral</li>
                    <li>Registros</li>
                    <li>Cofres</li>
                    <li>Relatórios</li>
                </ul>
            </nav>
        </aside>
    )
}
export default Sidebar