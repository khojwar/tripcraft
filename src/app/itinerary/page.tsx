'use client';

import { useState, useEffect } from 'react';
import BudgetSection from "./components/Budget-section"

import TripForm from './new/page';
import MapView from './components/MapView';

import { useSearchParams } from "next/navigation";

const ItineraryPage = () => {
  const [generatedWeather, setGeneratedWeather] = useState<any | null>(null);
  const weatherSearchParams = useSearchParams();
  const weatherParam = weatherSearchParams.get('weather');

  console.log("Weather Param from URL:", weatherParam);

  useEffect(() => {
    if (weatherParam) {
      try {
        const weatherData = JSON.parse(decodeURIComponent(weatherParam));
        setGeneratedWeather(weatherData);
      } catch (error) {
        console.error("Error parsing weather data from URL:", error);
        setGeneratedWeather(null);
      }
    } else {
      setGeneratedWeather(null);
    }
  }, [weatherParam]);

  return (
    <div>
      <TripForm />
      {generatedWeather?.coord?.lat ? (<MapView lat={generatedWeather?.coord?.lat} lon={generatedWeather?.coord?.lon} />): (<div></div>)}

    </div>
  )
}

export default ItineraryPage