 'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { generateItinerary } from '@/lib/llm';

// Schema
const travelSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  start: z.string().refine((v) => !!v, { message: 'Start date is required' }),
  end: z.string().refine((v) => !!v, { message: 'End date is required' }),
  travelers: z.number().min(1, 'At least one traveler'),
  style: z.enum(['relaxed', 'adventure', 'family', 'budget']),
  budget: z.number().min(0, 'Budget must be >= 0')
}).refine((data) => {
  if (!data.start || !data.end) return true; // other validators handle requiredness
  const s = new Date(data.start);
  const e = new Date(data.end);
  return e >= s;
}, {
  message: 'End date must be the same or after start date',
  path: ['end']
});

type TravelFormValues = z.infer<typeof travelSchema>;

type GeneratedData = any;

type TripFormProps = {
  onGeneratedAction?: (data: GeneratedData) => void;
};

export default function TravelForm({ onGeneratedAction }: TripFormProps) {

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<TravelFormValues>({
    resolver: zodResolver(travelSchema),
    defaultValues: {
      destination: '',
      start: '',
      end: '',
      travelers: 1,
      style: 'relaxed',
      budget: 0
    }
  });

  const onSubmit = async (data: TravelFormValues) => {
    console.log("Form submitted:", data);

    let out: any = null;  // ✅ declare here so it's accessible everywhere

    try {
      const prompt = `
          You are a travel planning AI.  
          Generate an itinerary in pure JSON with NO explanation.

          ### Inputs
          - Destination: ${data.destination}
          - Travelers: ${data.travelers}
          - Start date: ${data.start}
          - End date: ${data.end}
          - Travel style: ${data.style}
          - Max budget: ${data.budget}

          ### Output format (MANDATORY)
          {
            "itinerary": [
              {
                "day": 1,
                "date": "Monday, Dec 20",
                "activities": [
                  {
                    "time": "9:00 AM",
                    "title": "Breakfast",
                    "desc": "",
                    "cost": 0
                  }
                ]
              }
            ],
            "budget": {
              "total": 0,
              "perPerson": 0,
              "breakdown": {
                "food": 0,
                "transport": 0,
                "activities": 0,
                "accommodation": 0
              }
            }
          }

          Follow these rules:
          - Dates must be auto-calculated for each day.
          - Activities must be similar to the mock function logic.
          - Costs must be multiplied by number of travelers.
          - NO markup, NO explanation — only JSON.
          `;

      const payload = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      };

      const url = process.env.NEXT_PUBLIC_GEMINI_API_URL || '';

      // 🚀 this works now
      out = await generateItinerary(url, payload);

      // Convert to JS object (if string)
      const safeParseJson = (text: string) => {
        // Try direct parse first
        try {
          return JSON.parse(text);
        } catch (e) {
          // Strip common markdown fences like ```json ... ```
          const fenceReplaced = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim();

          try { return JSON.parse(fenceReplaced); } catch (e2) {
            // As a last resort, extract the first top-level JSON object by matching braces
            const firstBrace = fenceReplaced.indexOf('{');
            if (firstBrace === -1) throw e2;

            let depth = 0;
            let endIndex = -1;
            for (let i = firstBrace; i < fenceReplaced.length; i++) {
              const ch = fenceReplaced[i];
              if (ch === '{') depth++;
              else if (ch === '}') depth--;

              if (depth === 0) { endIndex = i; break; }
            }

            if (endIndex === -1) throw e2;

            const candidate = fenceReplaced.slice(firstBrace, endIndex + 1);
            return JSON.parse(candidate);
          }
        }
      };

      const parsed = typeof out === 'string' ? safeParseJson(out) : out;

      console.log('Parsed itinerary:', parsed);

      // send parsed data to parent (page) so it can render budget/itinerary
      if (onGeneratedAction) onGeneratedAction(parsed);


    } catch (error) {
      console.error("Error generating itinerary:", error);
    }
  };


  // demo payload
  const loadDemo = () => {
    const demo: TravelFormValues = {
      destination: 'Chitwan National Park, Nepal',
      start: '2025-06-01',
      end: '2025-06-03',
      travelers: 1,
      style: 'relaxed',
      budget: 800
    };
    reset(demo);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 px-4 py-6 md:mt-12"
    >
      <div className="w-full max-w-auto p-6 shadow-md md:border-2 md:shadow-2xl md:rounded-lg">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Plan your trip</h2>
          <p className="text-sm text-muted-foreground">Enter destinations, dates, and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Destination</label>
            <input
              aria-invalid={errors.destination ? 'true' : 'false'}
              placeholder="Where do you want to go?"
              className="mt-1 block w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register('destination')}
            />
            {errors.destination && <p className="text-xs text-red-600 mt-1">{errors.destination.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Start date</label>
            <input
              type="date"
              aria-invalid={errors.start ? 'true' : 'false'}
              className="mt-1 block w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register('start')}
            />
            {errors.start && <p className="text-xs text-red-600 mt-1">{errors.start.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">End date</label>
            <input
              type="date"
              aria-invalid={errors.end ? 'true' : 'false'}
              className="mt-1 block w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register('end')}
            />
            {errors.end && <p className="text-xs text-red-600 mt-1">{errors.end.message}</p>}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Travelers</label>
            <input
              type="number"
              min={1}
              aria-invalid={errors.travelers ? 'true' : 'false'}
              className="mt-1 block w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register('travelers', { valueAsNumber: true })}
            />
            {errors.travelers && <p className="text-xs text-red-600 mt-1">{errors.travelers.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Style</label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register('style')}
            >
              <option value="relaxed">Relaxed</option>
              <option value="adventure">Adventure</option>
              <option value="family">Family</option>
              <option value="budget">Budget</option>
            </select>
            {errors.style && <p className="text-xs text-red-600 mt-1">{errors.style.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Budget (total)</label>
            <input
              type="number"
              aria-invalid={errors.budget ? 'true' : 'false'}
              className="mt-1 block w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register('budget', { valueAsNumber: true })}
            />
            {errors.budget && <p className="text-xs text-red-600 mt-1">{errors.budget.message}</p>}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting} className="px-4 py-2">
            {isSubmitting ? 'Generating...' : 'Generate itinerary'}
          </Button>

          <button
            type="button"
            onClick={loadDemo}
            className="px-3 py-2 border rounded bg-transparent text-sm hover:bg-slate-50"
          >
            Use demo
          </button>

        </div>

        {/* Optional: quick validation preview */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Preview: {JSON.stringify(watch(), null, 2)}</p>
        </div>
      </div>
    </form>
  );
}
