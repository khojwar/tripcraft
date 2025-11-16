export async function generateItinerary(payload: any): Promise<any> {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_GEMINI_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // If JSON-mode is enabled, Gemini returns raw object directly
    if (data && !data.candidates) {
      return data;
    }

    // Otherwise extract from text mode
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return text;
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
}
