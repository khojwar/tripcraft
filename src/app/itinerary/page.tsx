'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from "next/dynamic";
import toast from 'react-hot-toast';

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

import { jsPDF } from "jspdf";


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

  const shownErrorToastRef = useRef(false);

  // if (generatedData?.error ) {
  //   return (
  //     <div>
  //       <TripForm />
  //     </div>
  //   );
  // }

  useEffect(() => {
    if (!generatedData) {
      shownErrorToastRef.current = false;
      return;
    }

    const isCityNotFound = generatedData?.message === 'city not found' || generatedData?.cod === '404' || generatedData?.cod === 404;
    const hasError = !!generatedData?.error || isCityNotFound;
    // Debug: log detection values so we can see why toast may not display
    // console.log('ItineraryPage: error detection', { generatedData, isCityNotFound, hasError, shownErrorToast: shownErrorToastRef.current });

    if (hasError && !shownErrorToastRef.current) {
      const rawMsg = generatedData?.message ?? generatedData?.error ?? (isCityNotFound ? 'city not found' : 'An error occurred');
      const display = String(rawMsg).startsWith('Error:') ? String(rawMsg) : `Error: ${rawMsg}`;
      // console.log('ItineraryPage: showing toast with message:', display);
      toast.error(display, { duration: 8000 });
      shownErrorToastRef.current = true;
    } else if (!hasError) {
      shownErrorToastRef.current = false;
    }
  }, [generatedData]);

  const isCityNotFound = generatedData?.message === 'city not found' || generatedData?.cod === '404' || generatedData?.cod === 404;

  if (isCityNotFound) {
    return (
      <div>
        <TripForm />
      </div>
    );
  }

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("TripCraft Itinerary", 10, 10);
    doc.text(JSON.stringify(generatedData, null, 2), 10, 20);

    doc.save("tripcraft_itinerary.pdf");
  };




  return (
    <div>
      <TripForm />

      {generatedData && (
        <div>
          <div className="flex justify-end m-4">
            <button
              onClick={downloadPDF}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            >
              Download PDF
            </button>
          </div>

          <div id="pdf-content">
            
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

            {generatedData?.location?.lat ? (<MapView lat={generatedData?.location?.lat} lon={generatedData?.location?.lon} />): (<div></div>)}


          </div>
        </div>
      )}

    </div>
  )
}

export default ItineraryPage