import { useEffect, useState } from "react";
import api, { BASE_URL } from "../api/axiosConfig";

export default function Hero() {

  const [heroes, setHeroes] = useState([]);
  const [current, setCurrent] = useState(0);


  // Fetch hero images
  useEffect(() => {

    api.get("/hero")
      .then(res => setHeroes(res.data))
      .catch(err => console.log(err));

  }, []);



  // Auto slide
  useEffect(() => {

    if (heroes.length === 0) return;

    const interval = setInterval(() => {

      setCurrent(prev =>
        prev === heroes.length - 1 ? 0 : prev + 1
      );

    }, 4000);

    return () => clearInterval(interval);

  }, [heroes]);



  if (heroes.length === 0) return null;



  return (

    <section className="relative mt-2 h-[50vh] md:h-[60vh] overflow-hidden">

      {/* Slides */}
      {heroes.map((hero, index) => (

        <div
          key={hero.id}
          className={`absolute w-full h-full transition-opacity duration-1000
          ${index === current ? "opacity-100" : "opacity-0"}`}
        >

          <img
            src={BASE_URL + hero.image}
            className="w-full h-full object-cover"
          />

        </div>

      ))}


      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">

        {heroes.map((_, index) => (

          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full cursor-pointer
            ${index === current ? "bg-white" : "bg-gray-400"}`}
          />

        ))}

      </div>


    </section>

  );

}