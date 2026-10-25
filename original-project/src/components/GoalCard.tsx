import './GoalCard.css'
import AnimatedNumber from './AnimatedNumber'

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

    return(
        <article className="goal-card">
            <div className="goal-card-header">
                <h3>{name}</h3>
                <span><AnimatedNumber value={Math.round(percentage)} format="percent" /></span>
            </div>

            <div className="goal-progress-track"
            role="progressbar"
            aria-label={`Progresso da meta ${name}`}
            aria-valuenow={Math.round(percentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            >
                <div className="goal-progress-fill goal-progress-enter"
                style={{ width: `${percentage}%` }}
                />

            </div>
            <p className="goal-values">
                <strong><AnimatedNumber value={current} /></strong>
                <span>de <AnimatedNumber value={target} /></span>
            </p>
        </article>
    )
}
export default GoalCard