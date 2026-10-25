import './SummaryCard.css'
import AnimatedNumber from './AnimatedNumber'

type SummaryCardProps = {
  title: string
  value: number
  description?: string
  icon?: string
  tone?: 'green' | 'red' | 'blue' | 'purple'
  animation?: 'income' | 'expense'
  entryOrder?: 1 | 2 | 3 | 4
}

function SummaryCard({ title, value, description, icon = '◈', tone = 'green', animation, entryOrder }: SummaryCardProps) {
  const entryClass = entryOrder ? ` page-stagger page-stagger-${entryOrder}` : ''
  return <article className={`summary-card tone-${tone}${entryClass}`}>
    <div className={`summary-icon${animation ? ` arrow-animation arrow-${animation}` : ''}`} aria-hidden="true">{icon}</div>
    <div className="summary-card-body">
      <h3>{title}</h3>
      <p className="summary-value"><AnimatedNumber value={value} /></p>
      <span>{description}</span>
    </div>
  </article>
}

export default SummaryCard
