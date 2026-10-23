import { NavLink, useLocation } from 'react-router-dom'
import './Sidebar.css'

const links = [
  { to: '/dashboard', label: 'Início', icon: '⌂', hash: '' },
  { to: '/dashboard#transacoes', label: 'Registros', icon: '⇄', hash: '#transacoes' },
  { to: '/dashboard#cofres', label: 'Cofres', icon: '▣', hash: '#cofres' },
  { to: '/dashboard#cofres', label: 'Aportes', icon: '◉', hash: '#cofres' },
  { to: '/dashboard#distribuicao', label: 'Relatórios', icon: '▥', hash: '#distribuicao' },
  { to: '/dashboard#topo', label: 'Configurações', icon: '⚙', hash: '#topo' },
]

function Sidebar() {
  const location = useLocation()
  return <aside className="sidebar">
    <NavLink to="/dashboard" className="sidebar-brand"><span className="brand-leaf">↗</span><strong>Meu Financeiro</strong></NavLink>
    <nav aria-label="Navegação principal"><ul>{links.map((link, index) => {
      const active = location.pathname === '/dashboard' && location.hash === link.hash && (link.hash !== '#cofres' || index === 2 || index === 3)
      return <li key={`${link.to}-${link.label}`}><NavLink to={link.to} className={`sidebar-link${active ? ' active' : ''}`}><span className="sidebar-link-icon" aria-hidden="true">{link.icon}</span>{link.label}</NavLink></li>
    })}</ul></nav>
    <div className="sidebar-profile"><span className="profile-avatar">U</span><div><strong>Minha conta</strong><small>Área pessoal</small></div><span className="profile-exit" aria-hidden="true">↪</span></div>
  </aside>
}
export default Sidebar
