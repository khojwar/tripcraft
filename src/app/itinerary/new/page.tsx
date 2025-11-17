'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

import { z } from "zod";

const tripSchema = z.object({
  tripDescription: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(500, "Description is too long — keep it under 500 characters"),
});

type TripSchemaType = z.infer<typeof tripSchema>;

const TripForm = () => {
  const form = useForm<TripSchemaType>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      tripDescription: ""
    }
  });

  const onSubmit = (data: TripSchemaType) => {
    console.log("Trip Data:", data);

    // Here you can call your itinerary generation function


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
                      placeholder="e.g., I want to go to Paris in July for a romantic getaway with a budget of $2000..."
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
