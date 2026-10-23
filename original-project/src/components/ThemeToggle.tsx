import './ThemeToggle.css'

type ThemeToggleProps = {
    isDark: boolean
    onToggle: () => void
}

function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
    return (
        <button
            className="theme-toggle"
            type="button"
            onClick={onToggle}
            aria-label={
                isDark ? 'Ativar tema claro' : 'Ativar tema escuro'
            }
        >
            <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span> {isDark ? 'Tema claro' : 'Tema escuro'}
            </button>
    )
}

export default ThemeToggle
