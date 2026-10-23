import './GoalCard.css'

type GoalCardProps = {
    name: string
    current: number
    target: number
}

function GoalCard({
    name,
    current,
    target
}: GoalCardProps){
    const percentage = 
    target > 0 ? Math.min((current / target) * 100, 100) : 0;

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    return(
        <article className="goal-card">
            <div className="goal-card-header">
                <h3>{name}</h3>
                <span>{Math.round(percentage)}%</span>
            </div>

            <div className="goal-progress-track"
            role="progressbar"
            aria-label={`Progresso da meta ${name}`}
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            >
                <div className="goal-progress-fill"
                style={{ width: `${percentage}%` }}
                />

            </div>
            <p className="goal-values">
                <strong>{formatCurrency(current)}</strong>
                <span>de {formatCurrency(target)}</span>
            </p>
        </article>
    )
}
export default GoalCard