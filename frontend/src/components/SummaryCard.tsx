import './SummaryCard.css'
type SummaryCardProps = {
    title: string;
    value: string;
    description?: string;
}
function SummaryCard({
    title,
    value,
    description
}: SummaryCardProps){
    return(
        <article className="summary-card">
            <h3>{title}</h3>
            <p className="summary-value">{value}</p>
            <span>{description}</span>
        </article>
    )
}
export default SummaryCard