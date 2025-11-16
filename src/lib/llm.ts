
export async function generateItinerary(prompt: string): Promise<string> {
try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_GEMINI_API_URL!,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );
    
      const data = await res.json();
    
      // Gemini response format
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
} catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
}
}





