'use client';

import { useState, useEffect } from 'react';
import dynamic from "next/dynamic";

import TripForm from './new/page';
// import MapView from './components/MapView';
const MapView = dynamic(() => import("./components/MapView"), {
  ssr: false,
});
import HeroHeader from './components/HeroHeader';
import ItinerarySection from './components/ItinerarySection';
import RecommendedAttractions from './components/RecommendedAttractions';
import WheretoEat from './components/WheretoEat';
import HotelRecommendations from './components/HotelRecommendations';

import { useSearchParams } from "next/navigation";


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

      { generatedData ? (
        <HeroHeader data={generatedData} />
      ) : (<div></div>) }

      {
        generatedData ? (
          <ItinerarySection data={generatedData} />
        ) : (<div></div>)
      }

      {
        generatedData ? (
          <RecommendedAttractions data={generatedData} />
        ) : (<div></div>)
      }

      { generatedData ? (<WheretoEat data={generatedData} />) : (<div></div>)}

      { generatedData ? (<HotelRecommendations data={generatedData} /> ) : (<div></div>)}

      {generatedData ? (<MapView lat={generatedData?.location?.lat} lon={generatedData?.location?.lon} />): (<div></div>)}

    </div>
  )
}

export default ItineraryPage