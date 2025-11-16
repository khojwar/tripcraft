'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';

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

export default function TravelForm() {
  const router = useRouter();

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

  const onSubmit = (data: TravelFormValues) => {
    // encode and navigate to itinerary page
    const encoded = encodeURIComponent(JSON.stringify(data));
    router.push(`/itinerary?payload=${encoded}`);

    console.log('Form submitted:', data);
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
