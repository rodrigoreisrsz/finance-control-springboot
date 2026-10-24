import './SummaryCard.css'

type SummaryCardProps = {
  title: string
  value: string
  description?: string
  icon?: string
  tone?: 'green' | 'red' | 'blue' | 'purple'
  animation?: 'income' | 'expense'
}

function SummaryCard({ title, value, description, icon = '◈', tone = 'green', animation }: SummaryCardProps) {
  return <article className={`summary-card tone-${tone}`}>
    <div className={`summary-icon${animation ? ` arrow-animation arrow-${animation}` : ''}`} aria-hidden="true">{icon}</div>
    <div className="summary-card-body">
      <h3>{title}</h3>
      <p className="summary-value">{value}</p>
      <span>{description}</span>
    </div>
  </article>
}

export default SummaryCard
