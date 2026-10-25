import { useEffect, useState } from 'react'
import { getCurrentProfilePhoto, subscribeToProfilePhoto } from '../services/profilePhoto'
import './Topbar.css'

type TopbarProps = { onSearch: (value: string) => void }
function Topbar({ onSearch }: TopbarProps) {
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(() => getCurrentProfilePhoto())

  useEffect(() => subscribeToProfilePhoto(() => setFotoPerfil(getCurrentProfilePhoto())), [])

  return <div className="topbar">
    <label className="topbar-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Buscar registros, cofres ou categorias..." aria-label="Buscar registros" onChange={(event) => onSearch(event.target.value)} /></label>
    <div className="topbar-actions"><button type="button" className="notification-button" aria-label="Notificações">♧<i /></button><div className="topbar-user"><span className="topbar-avatar">{fotoPerfil ? <img src={fotoPerfil} alt="" /> : 'U'}</span><span>Minha conta</span><span aria-hidden="true">⌄</span></div></div>
  </div>
}
export default Topbar
