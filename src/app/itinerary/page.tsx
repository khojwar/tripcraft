 'use client';

import { useState } from 'react';
import BudgetSection from "./components/Budget-section"
// import TravelForm from "./components/TravelForm"
import TripForm from './new/page';


const ItineraryPage = () => {
  const [generated, setGenerated] = useState<any | null>(null);

  return (
    <div>
      <TripForm />
      {/* <TravelForm onGeneratedAction={setGenerated} /> */}
      {generated?.budget && <BudgetSection {...generated.budget} />}
    </div>
  )
}

export default ItineraryPage