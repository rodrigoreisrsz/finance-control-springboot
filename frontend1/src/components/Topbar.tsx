
import './Topbar.css'

type TopbarProps = {
  onSearch: (value: string) => void
}

function Topbar({ onSearch }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <span aria-hidden="true">⌕</span>

        <input
          type="search"
          placeholder="Buscar transações..."
          aria-label="Buscar transações"
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>

      <div className="topbar-user">
        <span className="topbar-avatar">U</span>
        <span>Meu perfil</span>
      </div>
    </header>
  )
}

export default Topbar
