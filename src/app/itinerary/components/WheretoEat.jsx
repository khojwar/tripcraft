'use client';

import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { MapPin, Utensils } from "lucide-react"

const WheretoEat = ({data}) => {
  return (
    <div>
        <h1 className="font-bold text-3xl text-center mb-4">Where to Eat</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 ">
            {
                data?.recommended_restaurants?.map((r) => (
                    <Card key={r?.name} >
                        <CardTitle className="text-2xl font-bold px-6 flex items-center gap-2 text-yellow-600"><Utensils /> {r?.name}</CardTitle>
                        <CardDescription className="px-6 flex items-center gap-2"><MapPin /> {r?.address}</CardDescription>
                    </Card>
                ))
            }
        </div>

    </div>
  )
}

export default WheretoEat