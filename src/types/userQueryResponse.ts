export interface UserQueryResponse {
  destination: string | null;
  start_date: string | null;
  trip_length: number | null;
  travel_style: "budget" | "mid-range" | "luxury" | null;
  activities: (string | null)[];
  travelers: number | null;
  budget: number | null;
}
