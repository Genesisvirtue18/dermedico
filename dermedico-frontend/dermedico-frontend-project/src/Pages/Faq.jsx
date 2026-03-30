import { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaChevronDown } from "react-icons/fa";

const FAQS = [
  {
    question: "Are Dermedico products suitable for sensitive skin?",
    answer:
      "Yes, Dermedico products are dermatologically tested and formulated with skin-identical ingredients, making them suitable for sensitive and reactive skin types.",
  },
  {
    question: "Are your products dermatologist approved?",
    answer:
      "All Dermedico formulations are developed in collaboration with dermatologists and undergo rigorous testing to ensure safety and efficacy.",
  },
  {
    question: "Do Dermedico products contain parabens or sulphates?",
    answer:
      "No. Our products are free from parabens, sulphates, silicones, and other harsh chemicals. We focus on clean, skin-friendly formulations.",
  },
  {
    question: "Are Dermedico products cruelty-free?",
    answer:
      "Yes, Dermedico is completely cruelty-free. We do not test on animals and do not use animal-derived ingredients.",
  },
  {
    question: "How long does it take to see visible results?",
    answer:
      "Results may vary based on skin type and concern, but most users notice visible improvement within 3–4 weeks of consistent use.",
  },
  {
    question: "Can I use Dermedico products with other skincare brands?",
    answer:
      "Yes, Dermedico products are designed to integrate easily into most skincare routines. However, we recommend avoiding mixing multiple strong actives.",
  },
];

export default function FaqsPage() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full poppins-regular min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />

      {/* HEADER */}
      <section className="px-6 py-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-md uppercase tracking-widest text-[#1ba6a6] font-bold mb-3 block">
            FAQs
          </span>

          <h1 className="font-raleway font-light text-[36px] md:text-[42px] text-[#111111] mb-6">
            Frequently Asked <span className="font-semibold">Questions</span>
          </h1>

          <p className="text-[#555555] poppins-regular leading-relaxed">
            Everything you need to know about Dermedico products, formulations,
            usage, and safety — all in one place.
          </p>
        </div>
      </section>

      {/* FAQ LIST */}
      <section className="flex-grow px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {/* QUESTION */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-5 text-left"
              >
                <span className="font-medium text-[#111111]">
                  {faq.question}
                </span>

                <FaChevronDown
                  className={`text-gray-500 transition-transform ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ANSWER */}
              {activeIndex === index && (
                <div className="px-6 pb-5 text-[#4A4A4A] poppins-regular leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}

        </div>
      </section>

      <Footer />
    </div>
  );
}
