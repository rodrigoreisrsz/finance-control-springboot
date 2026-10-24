import { NavLink, useLocation } from 'react-router-dom'
import './Sidebar.css'

const links = [
  { to: '/dashboard', label: 'Início', icon: '⌂', hash: '' },
  { to: '/registros/novo', label: 'Registros', icon: '⇄', hash: '' },
  { to: '/cofres', label: 'Cofres', icon: '▣', hash: '' },
  { to: '/cofres', label: 'Aportes', icon: '◉', hash: '' },
  { to: '/dashboard#distribuicao', label: 'Relatórios', icon: '▥', hash: '#distribuicao' },
  { to: '/dashboard#topo', label: 'Configurações', icon: '⚙', hash: '#topo' },
]

function Sidebar() {
  const location = useLocation()
  return <aside className="sidebar">
    <NavLink to="/dashboard" className="sidebar-brand"><span className="brand-leaf">↗</span><strong>Meu Financeiro</strong></NavLink>
    <nav aria-label="Navegação principal"><ul>{links.map((link) => {
      const active =
        link.label === 'Registros'
          ? location.pathname === '/registros/novo'
          : link.label === 'Cofres'
            ? location.pathname === '/cofres'
            : link.label === 'Aportes'
              ? location.pathname === '/cofres'
              : location.pathname === '/dashboard' && location.hash === link.hash
      return <li key={`${link.to}-${link.label}`}><NavLink to={link.to} className={`sidebar-link${active ? ' active' : ''}`}><span className="sidebar-link-icon" aria-hidden="true">{link.icon}</span>{link.label}</NavLink></li>
    })}</ul></nav>
    <div className="sidebar-profile"><span className="profile-avatar">U</span><div><strong>Minha conta</strong><small>Área pessoal</small></div><span className="profile-exit" aria-hidden="true">↪</span></div>
  </aside>
}
export default Sidebar
