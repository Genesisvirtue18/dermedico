import React from "react";
import { FiPlus } from "react-icons/fi";
import strawberry from "../assets/fruits/strawberry.png";
import blueberry from "../assets/fruits/blueberry.png";
import waffle from "../assets/fruits/waffle.png";

const waffles = [
    { name: "Nutella", description: "Served with whipped cream, fresh fruits, and assorted sauces", price: "129 Kr" },
    { name: "Lotus", description: "Served with whipped cream, fresh fruits, and assorted sauces", price: "129 Kr" },
    { name: "Oreo", description: "Served with whipped cream, fresh fruits, and assorted sauces", price: "129 Kr" },
    { name: "Kinder", description: "Served with whipped cream, fresh fruits, and assorted sauces", price: "129 Kr" },
    { name: "Kitkat", description: "Served with whipped cream, fresh fruits, and assorted sauces", price: "129 Kr" },
    { name: "Rafaello", description: "Served with whipped cream, fresh fruits, and assorted sauces", price: "129 Kr" },
    { name: "Royal Pistachio", description: "Nutella, pistachio sauce, crushed pistachios, whipped cream, seasonal fruits", price: "129 Kr" },
];

const WafflesMenu = () => {
    return (
        <section className="bg-[#EEF2FF] poppins-regular min-h-screen font-sans px-2 py-8 relative overflow-hidden">
            {/* Top Navigation */}
            <nav className="flex justify-center gap-6 font-medium text-gray-800 mb-10 text-sm md:text-base">
                <button className="hover:text-yellow-500">PANCAKES</button>
                <button className="hover:text-yellow-500">CREPES</button>
                <button
                    className="bg-white text-[#CEAD41] border border-[#CEAD41] border-b-[4px] px-5 py-1 rounded-full font-semibold"
                >
                    WAFFLES
                </button>

                <button className="hover:text-yellow-500">DRINKS</button>
                <button className="hover:text-yellow-500">FRUIT SALADS</button>
                <button className="hover:text-yellow-500">EMPEROR BOWLS</button>
                <button className="hover:text-yellow-500">DUBAI CUP</button>
            </nav>

            {/* Sub Filters */}
            <div className="max-w-4xl mx-auto flex justify-start gap-2 mb-8 text-sm px-2 md:px-0">
                <button className="bg-[#CEAD41] text-white px-3 py-1 rounded-full font-medium">
                    Belgian Waffles
                </button>
                <button className="border border-[#CEAD41] text-[#CEAD41] px-3 py-1 rounded-full font-medium">
                    Crispy Waffles
                </button>
                <button className="border border-[#CEAD41] text-[#CEAD41] px-3 py-1 rounded-full font-medium">
                    Bubble Waffles
                </button>
            </div>

            {/* Fruit Decorations */}
           {/* Fruit Decorations */}
<img
  src={strawberry}
  alt="strawberry"
  className="absolute top-30 left-[8%] w-18 md:w-28 lg:w-32 opacity-90"
/>
<img
  src={blueberry}
  alt="blueberry"
  className="absolute top-32 right-[8%] w-24 md:w-32 lg:w-36 opacity-90"
/>
<img
  src={waffle}
  alt="waffle"
  className="absolute bottom-6 right-[8%] w-40 md:w-40 lg:w-60 opacity-95"
/>

            {/* Menu Grid */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {waffles.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm px-4 py-3 flex justify-between items-center transition-all 
                       border-t border-r border-b border-[#889DE3] border-l-[5px] border-l-[#889DE3] hover:shadow-md"
                    >
                        <div>
                            <h3 className="text-base font-semibold text-gray-800">{item.name}</h3>
                            <p className="text-gray-600 text-xs mt-1">{item.description}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-semibold text-[#1E1E1E] text-sm">{item.price}</span>
                            <button className="mt-2 bg-[#eef1fb] p-1.5 rounded-full hover:bg-yellow-100 transition">
                                <FiPlus size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WafflesMenu;
