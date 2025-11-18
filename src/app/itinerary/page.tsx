 'use client';

import { useState } from 'react';
import BudgetSection from "./components/Budget-section"

import TripForm from './new/page';

const ItineraryPage = () => {
  const [generated, setGenerated] = useState<any | null>(null);

  return (
    <div>
      <TripForm />
      {generated?.budget && <BudgetSection {...generated.budget} />}
    </div>
  )
}

export default ItineraryPage