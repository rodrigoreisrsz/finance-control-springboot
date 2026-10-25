import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { getCurrentProfilePhoto, subscribeToProfilePhoto } from '../services/profilePhoto'
import './Sidebar.css'

const links = [
  { to: '/dashboard', label: 'Início', icon: '⌂', hash: '' },
  { to: '/registros/novo', label: 'Registros', icon: '⇄', hash: '' },
  { to: '/cofres', label: 'Cofres', icon: '▣', hash: '' },
  { to: '/relatorios', label: 'Relatórios', icon: '▥', hash: '' },
  { to: '/configuracoes', label: 'Configurações', icon: '⚙', hash: '' },
]

function Sidebar() {
  const location = useLocation()
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(() => getCurrentProfilePhoto())

  useEffect(() => subscribeToProfilePhoto(() => setFotoPerfil(getCurrentProfilePhoto())), [])

  return <aside className="sidebar">
    <NavLink to="/dashboard" className="sidebar-brand"><span className="brand-leaf">↗</span><strong>Meu Financeiro</strong></NavLink>
    <nav aria-label="Navegação principal"><ul>{links.map((link) => {
      const active =
        link.label === 'Registros'
          ? location.pathname === '/registros/novo'
          : link.label === 'Cofres'
            ? location.pathname === '/cofres'
            : link.label === 'Relatórios'
              ? location.pathname === '/relatorios'
              : link.label === 'Configurações'
                ? location.pathname === '/configuracoes'
                : location.pathname === '/dashboard' && location.hash === link.hash
      return <li key={`${link.to}-${link.label}`}><NavLink to={link.to} className={`sidebar-link${active ? ' active' : ''}`}><span className="sidebar-link-icon" aria-hidden="true">{link.icon}</span>{link.label}</NavLink></li>
    })}</ul></nav>
    <NavLink to="/configuracoes" className="sidebar-profile" aria-label="Abrir perfil e configurações"><span className="profile-avatar">{fotoPerfil ? <img src={fotoPerfil} alt="" /> : 'U'}</span><div><strong>Minha conta</strong><small>Área pessoal</small></div><span className="profile-exit" aria-hidden="true">↪</span></NavLink>
  </aside>
}
export default Sidebar
