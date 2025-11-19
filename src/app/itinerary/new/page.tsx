'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

import { z } from "zod";

import { generateItinerary } from "@/lib/llm";
import { UserQueryResponse } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

const tripSchema = z.object({
  tripDescription: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(500, "Description is too long — keep it under 500 characters"),
});

type TripSchemaType = z.infer<typeof tripSchema>;

const DEFAULT_TRIP_DESCRIPTION = {
      tripDescription: "I want to go to Kathmandu in July for a romantic getaway with a budget of $2000, including museums and fine dining"
    };

const TripForm = () => {

  const [weather, setWeather] = useState<any | null>(null);
  const router = useRouter();

  const form = useForm<TripSchemaType>({
    resolver: zodResolver(tripSchema),
    defaultValues: DEFAULT_TRIP_DESCRIPTION
  });

  const onSubmit = async (data: TripSchemaType) => {
    console.log("Trip Data:", data);

    const prompt = `
    You are a travel itinerary assistant. Your task is to extract structured fields from a natural-language trip description. 

    ALWAYS return ONLY a valid JSON object with this structure:

    {
    "destination": "string (city or country; if none mentioned, infer from context or return null)",
    "start_date": "YYYY-MM-DD (if no date mentioned, return null)",
    "trip_length": number (duration in days; if unclear, infer from wording like 'weekend', otherwise default to 3),
    "travel_style": "budget | mid-range | luxury (infer if possible, otherwise 'mid-range')",
    "activities": ["array", "of", "strings"], 
    "travelers": number (infer phrases like 'we', 'my family'; default to 1),
    "budget": number (total budget in USD; if none mentioned, return null)
    }

    RULES:
    - If the user does NOT mention something, DO NOT guess randomly. Use defaults.
    - Infer only when the wording strongly implies something (e.g., "solo trip" → 1 traveler, "family trip" → 3 or 4 depending on wording).
    - destination: If multiple places are mentioned, select the main one.
    - start_date: If a date range is given, use the first date. If seasons like “this summer” → return null (handled by frontend).
    - activities: extract only explicit verbs/nouns like “hiking”, “food tour”, “skiing”, “beach”, etc.
    - Return ONLY raw JSON, no explanations.

    User's trip description:
    "${data.tripDescription}"
    `;


    const payload = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    }

    const url = process.env.NEXT_PUBLIC_GEMINI_API_URL || '';

    let userQueryString: string;
    try {
      userQueryString = await generateItinerary(url, payload);
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      return;
    }

    console.log("Generated User Query String:", userQueryString);

    // Clean the response to remove markdown code blocks if present
    let cleanedUserQueryString = userQueryString.trim();
    if (cleanedUserQueryString.startsWith('```json')) {
      cleanedUserQueryString = cleanedUserQueryString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }

    let userQuery: UserQueryResponse;
    try {
      userQuery = JSON.parse(cleanedUserQueryString);
    } catch (error) {
      console.error("Failed to parse userQuery:", error);
      return;
    }

    console.log("Parsed User Query:", userQuery);

    // *************************************************************
    // weather api    -- to get landmarks, restaurants, attractions, hotels
    // *************************************************************

    const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';
    const userDestination = userQuery.destination;

    if (!userDestination || userDestination.toLowerCase() === "null") {
      console.log("No destination provided, skipping weather fetch.");
      return;
    }

    const weatherUrl =  `https://api.openweathermap.org/data/2.5/weather?q=${userDestination}&appid=${WEATHER_API_KEY}&units=metric`

    const weather = await fetch(weatherUrl).then(r => r.json());
    console.log("weather", weather);
    // console.log("Latitude:", lat, "Longitude:", lon);

    setWeather(weather);

 
    // *************************************************************
    // Place API (Geoapify) -- to get landmarks, restaurants, attractions, hotels
    // *************************************************************

    try {
          const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "";
          const { lat, lon } = weather.coord;
      
          // Fetch nearby attractions (landmarks, museums, etc.)
          const attractionsUrl = `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:${lon},${lat},5000&limit=10&apiKey=${GEOAPIFY_KEY}`;
          const attractions = await fetch(attractionsUrl).then(r => r.json());
          console.log("Attractions:", attractions);
      
          // Fetch nearby restaurants
          const restaurantsUrl = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},5000&limit=10&apiKey=${GEOAPIFY_KEY}`;
          const restaurants = await fetch(restaurantsUrl).then(r => r.json());
          console.log("Restaurants:", restaurants);
      
          // Fetch hotels
          const hotelsUrl = `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lon},${lat},5000&limit=10&apiKey=${GEOAPIFY_KEY}`;
          const hotels = await fetch(hotelsUrl).then(r => r.json());
          console.log("Hotels:", hotels);
    } catch (error) {
      
    }


    router.push(`/itinerary?weather=${encodeURIComponent(JSON.stringify(weather))}`);


  };
  

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-180px)] p-4">
      <div className="flex flex-col justify-center text-center w-full max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold mb-4">TripCraft</h1>
        <p>Describe your dream trip in a sentence</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">

            {/* Textarea Field */}
            <FormField
              control={form.control}
              name="tripDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="w-full max-w-xl mx-auto resize-y"
                      placeholder="e.g., I want to go to Nepal in July for a romantic getaway with a budget of $2000..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full max-w-xl mx-auto" type="submit">
              Plan My Trip
            </Button>
          </form>
        </Form>

      </div>
    </div>
  );
};

export default TripForm;
