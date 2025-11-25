'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Landmark, MapPin } from "lucide-react"

const RecommendedAttractions = ({data}) => {
  return (
    <div>
        <h1 className='text-3xl text-center font-bold mb-4'>Recommended Attractions</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 ">
            {
                data?.recommended_attractions?.map((attraction) => (
                    <Card key={attraction?.name}>
                        <CardTitle className="text-2xl font-bold px-6 flex items-center gap-2 text-yellow-600"><Landmark /> {attraction?.name}</CardTitle>
                        <CardDescription className="px-6 flex items-center gap-2"><MapPin /> {attraction?.address}</CardDescription>
                        <CardContent>{attraction?.category && `Category: ${attraction?.category}`}</CardContent>
                    </Card>
                ))
            }
        </div>
    </div>
  )
}

export default RecommendedAttractions