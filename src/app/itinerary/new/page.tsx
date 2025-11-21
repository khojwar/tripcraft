"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";

import { generateItinerary } from "@/lib/llm";
import { UserQueryResponse } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface GeoapifyFeature {
  properties: {
    name: string;
    address_line1: string;
    categories?: string[];
    cuisines?: string[];
  };
}

const tripSchema = z.object({
  tripDescription: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(500, "Description is too long — keep it under 500 characters"),
});

type TripSchemaType = z.infer<typeof tripSchema>;

const DEFAULT_TRIP_DESCRIPTION = {
  tripDescription:
    "I want to go to Kathmandu in July for a romantic getaway with a budget of $2000, including museums and fine dining",
};

const TripForm = () => {
  const [weather, setWeather] = useState<any | null>(null);
  const [userQuery, setUserQuery] = useState<UserQueryResponse | null>(null);
  const [attractions, setAttractions] = useState<any | null>(null);
  const [restaurants, setRestaurants] = useState<any | null>(null);
  const [hotels, setHotels] = useState<any | null>(null);

  const router = useRouter();

  const form = useForm<TripSchemaType>({
    resolver: zodResolver(tripSchema),
    defaultValues: DEFAULT_TRIP_DESCRIPTION,
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: TripSchemaType) => {
    setLoading(true);
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
    "budget": number (total budget in USD; if none mentioned, return null),
    "error": "string (only include if date validation fails, otherwise omit this field)"
    }

    RULES:
    - If the user does NOT mention something, DO NOT guess randomly. Use defaults.
    - Infer only when the wording strongly implies something (e.g., "solo trip" → 1 traveler, "family trip" → 3 or 4 depending on wording).
    - destination: If multiple places are mentioned, select the main one.
    - start_date: If a date range is given, use the first date. If seasons like "this summer" → return null (handled by frontend).
    - **DATE VALIDATION**: If a specific date is mentioned, check if it is in the past (before today's date: ${new Date().toISOString().split('T')[0]}). If the date is in the past, include an "error" field with the message: "Please provide a future date within the next 7 days for trip planning."
    - If the date is valid (today or in the future within 7 days), proceed normally without the error field.
    - activities: extract only explicit verbs/nouns like "hiking", "food tour", "skiing", "beach", etc.
    - Return ONLY raw JSON, no explanations.

    User's trip description:
    "${data.tripDescription}"
    `;

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const url = process.env.NEXT_PUBLIC_GEMINI_API_URL || "";

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
    if (cleanedUserQueryString.startsWith("```json")) {
      cleanedUserQueryString = cleanedUserQueryString
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    }

    let userQuery: UserQueryResponse;
    try {
      userQuery = JSON.parse(cleanedUserQueryString);
      setUserQuery(userQuery);
    } catch (error) {
      console.error("Failed to parse userQuery:", error);
      return;
    }

    console.log("Parsed User Query:", userQuery);

    if (userQuery?.error) {
      setLoading(false);
      // console.error("Date validation error:", userQuery?.error);
      router.push(`/itinerary?data=${encodeURIComponent(JSON.stringify(userQuery))}`);
      return;
    }

    // *************************************************************
    // weather api    -- to get landmarks, restaurants, attractions, hotels
    // *************************************************************

    const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";
    const userDestination = userQuery.destination;

    if (!userDestination || userDestination.toLowerCase() === "null") {
      console.log("No destination provided, skipping weather fetch.");
      return;
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${userDestination}&appid=${WEATHER_API_KEY}&units=metric`;

    const weather = await fetch(weatherUrl).then((r) => r.json());
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
      const attractions = await fetch(attractionsUrl).then((r) => r.json());
      console.log("Attractions:", attractions);
      setAttractions(attractions);

      // Fetch nearby restaurants
      const restaurantsUrl = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lon},${lat},5000&limit=10&apiKey=${GEOAPIFY_KEY}`;
      const restaurants = await fetch(restaurantsUrl).then((r) => r.json());
      console.log("Restaurants:", restaurants);
      setRestaurants(restaurants);

      // Fetch hotels
      const hotelsUrl = `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lon},${lat},5000&limit=10&apiKey=${GEOAPIFY_KEY}`;
      const hotels = await fetch(hotelsUrl).then((r) => r.json());
      console.log("Hotels:", hotels);
      setHotels(hotels);
    } catch (error) {
      console.error("Error fetching places data:", error);
    }

    // Ensure data is not null to prevent errors
    const attractionsData = attractions || { features: [] };
    const restaurantsData = restaurants || { features: [] };
    const hotelsData = hotels || { features: [] };

    // const finalPrompt = `
    //     You are a travel itinerary generator AI.

    //     Using the user's extracted trip details and the fetched real-world data, generate a structured JSON itinerary.

    //     RETURN ONLY VALID JSON. NO MARKDOWN. NO COMMENTS.

    //     ===========================
    //     USER TRIP DETAILS (Parsed):
    //     ===========================
    //     ${JSON.stringify(userQuery, null, 2)}

    //     ===========================
    //     WEATHER DATA (API - OpenWeatherMap):
    //     ===========================
    //     ${JSON.stringify(weather, null, 2)}

    //     ===========================
    //     ATTRACTIONS (Geoapify):
    //     ===========================
    //     ${JSON.stringify(attractions, null, 2)}

    //     ===========================
    //     RESTAURANTS (Geoapify):
    //     ===========================
    //     ${JSON.stringify(restaurants, null, 2)}

    //     ===========================
    //     HOTELS (Geoapify):
    //     ===========================
    //     ${JSON.stringify(hotels, null, 2)}

    //     ===========================
    //     COORDINATES:
    //     ===========================
    //     {
    //       "lat": ${weather.coord.lat},
    //       "lon": ${weather.coord.lon}
    //     }

    //     =================================================
    //     GENERATE THIS FINAL JSON STRUCTURE:
    //     =================================================
    //     {
    //       "destination": "string",
    //       "trip_length": number,
    //       "location": {
    //         "lat": number,
    //         "lon": number
    //       },
    //       "overview_weather_summary": "Short description summarizing temperature, condition, and tips",
    //       "itinerary": [
    //         {
    //           "day": number,
    //           "weather": {
    //             "temp": number,
    //             "description": "string"
    //           },
    //           "morning": "activity suggestion using attractions + user activities",
    //           "afternoon": "activity suggestion using attractions or food",
    //           "evening": "restaurant or night activity",
    //           "hotel_suggestion": {
    //             "name": "string",
    //             "address": "string"
    //           }
    //         }
    //       ],
    //       "recommended_attractions": [
    //         {
    //           "name": "string",
    //           "category": "string",
    //           "address": "string"
    //         }
    //       ],
    //       "recommended_restaurants": [
    //         {
    //           "name": "string",
    //           "address": "string",
    //           "cuisine": "string | null"
    //         }
    //       ],
    //       "recommended_hotels": [
    //         {
    //           "name": "string",
    //           "address": "string"
    //         }
    //       ]
    //     }

    //     =================================================
    //     RULES:
    //     =================================================
    //     - Use ONLY the provided API data. Do NOT invent new places.
    //     - Use the provided lat/lon from the weather API.
    //     - Itinerary must contain EXACT number of days equal to trip_length.
    //     - If weather API doesn't provide a forecast list, reuse the same weather for each day.
    //     - Match attractions with user activities (e.g., “hiking” → hiking POIs).
    //     - Never explain—ONLY output clean JSON.
    //     `;

    //     const finalpayload = {
    //         contents: [
    //           {
    //             parts: [{ text: finalPrompt }]
    //           }
    //         ]
    //       };

    //       let finalItineraryString;
    //       try {
    //         finalItineraryString = await generateItinerary(url, finalpayload);
    //       } catch (error) {
    //         await new Promise(r => setTimeout(r, 3000));
    //         finalItineraryString = await generateItinerary(url, finalpayload);
    //       }

    //       console.log("Generated Final Itinerary String:", finalItineraryString);

    //       // Remove markdown wrapper if any
    //       const cleaned = finalItineraryString
    //         .replace(/^```json/, "")
    //         .replace(/```$/, "")
    //         .trim();

    //       const finalItinerary = await JSON.parse(cleaned);

    //       console.log("FINAL ITINERARY JSON:", finalItinerary);
   
   
   

    // step1: META SUMMARY PROMPT
    // Fetch weather forecast for trip duration
    let weatherForecast: any[] = [];
    if (userQuery.trip_length && userQuery.trip_length <= 7) {
      try {
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${userDestination}&appid=${WEATHER_API_KEY}&units=metric`;
      const forecastResponse = await fetch(forecastUrl).then((r) => r.json());
      
      // OpenWeatherMap forecast API returns 3-hour interval data for 5 days
      // Group by day and get one forecast per day
      const dailyForecasts = new Map<string, any>();
      forecastResponse.list?.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!dailyForecasts.has(dateKey)) {
      dailyForecasts.set(dateKey, {
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        description: item.weather[0].description,
        date: dateKey
      });
      }
      });
      
      weatherForecast = Array.from(dailyForecasts.values()).slice(0, userQuery.trip_length);
      console.log("Weather Forecast:", weatherForecast);
      } catch (error) {
      console.error("Error fetching weather forecast:", error);
      // Fallback to current weather for all days with dates starting from today
      const today = new Date();
      weatherForecast = Array(userQuery.trip_length).fill(null).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return {
        temp: weather?.main?.temp,
        feels_like: weather?.main?.feels_like,
        description: weather?.weather?.[0]?.description,
        date: date.toISOString().split('T')[0]
      };
      });
      }
    } else {
      // For trips longer than 7 days or no duration, use current weather with dates
      const today = new Date();
      weatherForecast = Array(userQuery.trip_length || 3).fill(null).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return {
        temp: weather?.main?.temp,
        feels_like: weather?.main?.feels_like,
        description: weather?.weather?.[0]?.description,
        date: date.toISOString().split('T')[0]
      };
      });
    }

    const step1Prompt = `
    You are a travel data summarizer AI.

    Your job is to take large raw API responses and compress them into a small JSON summary.

    RETURN ONLY VALID JSON. NO MARKDOWN.

    ==============================
    USER TRIP DETAILS:
    ==============================
    ${JSON.stringify(userQuery, null, 2)}

    ==============================
    WEATHER FORECAST (Day-by-Day):
    ==============================
    ${JSON.stringify(weatherForecast, null, 2)}

    ==============================
    COMPACT ATTRACTIONS (TOP 10):
    ==============================
    ${JSON.stringify(
      attractionsData.features.map((a: GeoapifyFeature) => ({
      name: a.properties.name,
      address: a.properties.address_line1,
      category: a.properties.categories?.[0] || null,
      })),
      null,
      2
    )}

    ==============================
    COMPACT RESTAURANTS (TOP 10):
    ==============================
    ${JSON.stringify(
      restaurantsData.features.map((r: GeoapifyFeature) => ({
      name: r.properties.name,
      address: r.properties.address_line1,
      cuisine: r.properties.cuisines?.[0] || null,
      })),
      null,
      2
    )}

    ==============================
    COMPACT HOTELS (TOP 10):
    ==============================
    ${JSON.stringify(
      hotelsData.features.map((h: GeoapifyFeature) => ({
      name: h.properties.name,
      address: h.properties.address_line1,
      })),
      null,
      2
    )}

    ==============================
    COORDINATES:
    ==============================
    {
      "lat": ${weather.coord.lat},
      "lon": ${weather.coord.lon}
    }

    ==============================
    OUTPUT JSON STRUCTURE:
    ==============================
    {
      "destination": "string",
      "lat": number,
      "lon": number,
      "weather_summary": "Short sentence summarizing overall weather for the trip duration",
      "daily_weather": [
      {
      "day": number,
      "date": "YYYY-MM-DD",
      "temp": number,
      "feels_like": number,
      "description": "string"
      }
      ],
      "top_attractions": [
      {
      "name": "string",
      "address": "string",
      "contact": "string (phone number if available, otherwise null)"
      }
      ],
      "top_restaurants": [
      {
      "name": "string",
      "address": "string",
      "contact": "string (phone number if available, otherwise null)",
      "cuisine": "string | null"
      }
      ],
      "top_hotels": [
      {
      "name": "string",
      "address": "string",
      "contact": "string (phone number if available, otherwise null)"
      }
      ]
    }

    Rules:
    - Include day-by-day weather from the forecast data provided with dates in YYYY-MM-DD format.
    - Weather summary should mention temperature range and conditions across all days.
    - Pick 3–6 best attractions / restaurants / hotels FROM THE PROVIDED DATA ONLY.
    - If no attractions/restaurants/hotels are found in the data, suggest common/popular options for ${userQuery.destination} based on your knowledge.
    - Do NOT leave arrays empty. Always provide at least 3 items per category.
    - Ensure all place names and addresses are realistic and relevant to ${userQuery.destination}.
    - Each item must include name, address, and contact (if available from API data or your knowledge).
    - If contact information is not available, use null.
    - Return ONLY JSON.
    `;

      // Call LLM Step 1
      const step1Payload = {
      contents: [{ parts: [{ text: step1Prompt }] }],
      };

      let step1Response: string;
      try {
      step1Response = await generateItinerary(url, step1Payload);
      } catch (error) {
      console.error("Error in Step 1:", error);
      throw new Error("Failed to generate travel summary");
      }

      const summaryJSON = JSON.parse(
      step1Response.replace(/^```json|```$/g, "").trim()
      );
      console.log("META SUMMARY:", summaryJSON);

      // Validate summary has required data
      if (!summaryJSON.top_attractions?.length || 
      !summaryJSON.top_restaurants?.length || 
      !summaryJSON.top_hotels?.length) {
      console.warn("Summary JSON missing some data, but proceeding with fallback");
      }

      // STEP 2 — USE SUMMARY JSON TO GENERATE FINAL ITINERARY
      const step2Prompt = `
    You are a travel itinerary generator AI.

    Using ONLY this summary JSON, generate a complete day-by-day itinerary based on the user's specified trip length.

    RETURN ONLY VALID JSON. NO MARKDOWN.

    ==============================
    SUMMARY DATA:
    ==============================
    ${JSON.stringify(summaryJSON, null, 2)}

    ==============================
    USER PREFERENCES:
    ==============================
    - Trip Length: ${userQuery.trip_length} days
    - Travel Style: ${userQuery.travel_style || 'mid-range'}
    - Activities: ${userQuery.activities?.join(', ') || 'general sightseeing'}
    - Budget: ${userQuery.budget ? `$${userQuery.budget}` : 'flexible'}

    ==============================
    FINAL JSON STRUCTURE:
    ==============================
    {
      "destination": "string",
      "trip_length": ${userQuery.trip_length},
      "location": {
      "lat": number,
      "lon": number
      },
      "overview_weather_summary": "string (include temperature range and conditions across trip duration)",
      "itinerary": [
      {
      "day": number,
      "date": "YYYY-MM-DD",
      "weather": {
      "temp": number,
      "feels_like": number,
      "description": "string"
      },
      "morning": "string (specific activity at a real place from summary)",
      "afternoon": "string (specific activity at a real place from summary)",
      "evening": "string (specific restaurant or activity from summary)",
      "hotel_suggestion": {
      "name": "string (from summary hotels)",
      "address": "string",
      "contact": "string | null"
      }
      }
      ],
      "recommended_attractions": [
      {
      "name": "string",
      "address": "string",
      "contact": "string | null"
      }
      ],
      "recommended_restaurants": [
      {
      "name": "string",
      "address": "string",
      "contact": "string | null",
      "cuisine": "string | null"
      }
      ],
      "recommended_hotels": [
      {
      "name": "string",
      "address": "string",
      "contact": "string | null"
      }
      ]
    }

    Rules:
    - Use ONLY places from the summary data with their full details (name, address, contact).
    - Use the day-by-day weather from summary.daily_weather for each corresponding day, INCLUDING the date field.
    - Each day in the itinerary MUST include the date in YYYY-MM-DD format from the weather data.
    - Match activities to user preferences: ${userQuery.activities?.join(', ') || 'sightseeing'}.
    - Consider weather conditions when suggesting activities (e.g., indoor activities for rainy days).
    - itinerary.length must equal exactly ${userQuery.trip_length} days.
    - Each day must have accurate weather and date from the forecast data.
    - Each day must reference REAL place names from summary (not generic terms).
    - Morning/afternoon/evening must be specific: "Visit [Place Name] at [Address]" or "Dine at [Restaurant Name]".
    - Vary hotel suggestions across days if multiple hotels available.
    - Ensure all recommendations match the destination: ${userQuery.destination}.
    - All recommended items must include name, address, and contact fields.
    - No explanation. Only JSON.
    `;

      // Call LLM Step 2
      const step2Payload = {
      contents: [{ parts: [{ text: step2Prompt }] }],
      };

      let finalItineraryString: string;
      try {
      finalItineraryString = await generateItinerary(url, step2Payload);
      } catch (error) {
      console.error("Error in Step 2:", error);
      throw new Error("Failed to generate final itinerary");
      }

      const finalItinerary = JSON.parse(
      finalItineraryString.replace(/^```json|```$/g, "").trim()
      );

      console.log("FINAL ITINERARY JSON:", finalItinerary);

    router.push(
      `/itinerary?data=${encodeURIComponent(JSON.stringify(finalItinerary))}`
    );

    setLoading(false);
  };

  return (
    <div className={`flex items-center justify-center min-h-[calc(100vh-180px)] p-4 ${loading ? "opacity-50 pointer-events-none" : ""} py-8`}>
      <div className="flex flex-col justify-center text-center w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">TripCraft</h1>
        <p>Describe your dream trip in a sentence</p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            {/* Textarea Field */}
            <FormField
              control={form.control}
              name="tripDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="w-full max-w-xl mx-auto resize-y lg:h-32 lg:w-full lg:min-w-2xl "
                      placeholder="e.g., I want to go to Nepal in July for a romantic getaway with a budget of $2000..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full max-w-xl mx-auto lg:min-w-2xl "
              type="submit"
            >
              Plan My Trip
            </Button>
          </form>
        </Form>
        {loading && (
          <div className="mt-6 flex flex-col items-center justify-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <div className="space-y-2">
              <p className="text-lg font-medium animate-pulse">Generating your itinerary...</p>
              <p className="text-sm text-muted-foreground">Finding the best places for your trip</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default TripForm;
