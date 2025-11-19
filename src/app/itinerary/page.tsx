'use client';

import { useState, useEffect } from 'react';
import BudgetSection from "./components/Budget-section"

import TripForm from './new/page';
import MapView from './components/MapView';

import { useSearchParams } from "next/navigation";
import { Divide } from 'lucide-react';

const ItineraryPage = () => {
  const [generatedData, setGeneratedData] = useState<any | null>(null);
  const searchParams = useSearchParams();
  const DataParam = searchParams.get('data');

  console.log("Final data Param from URL:", DataParam);

  useEffect(() => {
    if (DataParam) {
      try {
        const Data = JSON.parse(decodeURIComponent(DataParam));
        setGeneratedData(Data);
      } catch (error) {
        console.error("Error parsing weather data from URL:", error);
        setGeneratedData(null);
      }
    } else {
      setGeneratedData(null);
    }
  }, [DataParam]);

  return (
    <div>
      <TripForm />
      {generatedData && <div> I am here </div>}
      {generatedData ? (<MapView lat={generatedData?.location?.lat} lon={generatedData?.location?.lon} />): (<div></div>)}

    </div>
  )
}

export default ItineraryPage