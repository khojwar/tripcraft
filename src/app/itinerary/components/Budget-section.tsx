

interface BudgetProps {
  total: number;
  perPerson: number;
  breakdown: {
    food: number;
    transport: number;
    activities: number;
    accommodation: number;
  };
}

const BudgetSection = (budget: BudgetProps) => {
  return (
    <div>
        <h1>Budget Breakdown</h1>
        <p>Total Budget: ${budget.total}</p>
        <p>Per Person: ${budget.perPerson}</p>
        <h2>Breakdown:</h2>
        <ul>
            <li>Food: ${budget.breakdown.food}</li>
            <li>Transport: ${budget.breakdown.transport}</li>
            <li>Activities: ${budget.breakdown.activities}</li>
            <li>Accommodation: ${budget.breakdown.accommodation}</li>
        </ul>
    </div>
  )
}

export default BudgetSection