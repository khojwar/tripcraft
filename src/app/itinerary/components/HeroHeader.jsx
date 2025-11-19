

const HeroHeader = ({data}) => {
return (
<header className="flex flex-col items-center justify-center text-center mb-8 gap-4 h-64 rounded-2xl mx-4 bg-gray-300 dark:bg-gray-900 ">
      <h1 className="text-4xl font-bold ">{data.destination}</h1>
      <p className="font-extrabold"> <span className=" text-blue-700">{data.trip_length}</span> - Day Journey</p>
      <div className="">
        {data.overview_weather_summary}
      </div>
    </header>
)
}

export default HeroHeader