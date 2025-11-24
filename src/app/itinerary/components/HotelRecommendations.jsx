'use client';

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const HotelRecommendations = ({data}) => {
  return (
    <div>
        <h1 className="font-bold text-3xl text-center mb-4">Hotel Recommendations</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 ">
            {
                data?.recommended_hotels?.map((h) => (
                    <Card key={h?.name} >
                        <CardTitle className="text-2xl font-bold px-6">{h?.name}</CardTitle>
                        <CardDescription className="px-6">{h?.address}</CardDescription>
                    </Card>
                ))
            }
        </div>
    </div>
  )
}

export default HotelRecommendations