
import "./SummaryCard.css"

type SummaryCardProps = {
  title: string
  value: string
  description?: string
  icon?: string
  trend?: string
  tone?: "green" | "red" | "blue" | "purple"
}

function SummaryCard({
  title,
  value,
  description,
  icon = "◈",
  trend,
  tone = "green",
}: SummaryCardProps) {
  return (
    <article className="summary-card">
      <div className="summary-card-top">
        <h3>{title}</h3>

        <div className={`summary-card-icon ${tone}`}>
          {icon}
        </div>
      </div>

      <p className="summary-value">{value}</p>

      <div className="summary-card-bottom">
        {description && <span>{description}</span>}

        {trend && (
          <span className={`summary-trend ${tone}`}>
            {trend}
          </span>
        )}
      </div>
    </article>
  )
}

export default SummaryCard
