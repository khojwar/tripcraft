import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card"

const ItinerarySection = ({data}) => {
  return (
    <div className='mb-4'>
        <h1 className='text-3xl text-center font-bold mb-4'>Your 3-Day Itinerary</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 ">
            {data?.itinerary.map((d) => (
                <Card key={d?.day} >
                    <CardTitle className="text-center text-2xl font-bold">Day {d?.day}</CardTitle>
                    <p className="text-center font-semibold">{d?.weather?.temp} - {d?.weather?.description}</p>

                    <CardContent>
                        <div className="mb-4">
                            <h1 className="font-bold">Morning</h1>
                            <p>{d?.morning}</p>
                        </div>
                        <div className="mb-4">
                            <h1 className="font-bold">Afternoon</h1>
                            <p>{d?.afternoon}</p>
                        </div>
                        <div className="mb-4">
                            <h1 className="font-bold">Evening</h1>
                            <p>{d?.evening}</p>
                        </div>
                    </CardContent>
                    <div className="p-4 border-l-8 rounded-2xl shadow-2xl  border-blue-500 m-4">
                        <p>Stay at</p>
                        <h1 className="font-bold">{d?.hotel_suggestion?.name}</h1>
                        <p className="text-gray-50/50">{d?.hotel_suggestion?.address}</p>
                    </div>
                </Card>
            ))}
        </div>

    </div>
  )
}

export default ItinerarySection