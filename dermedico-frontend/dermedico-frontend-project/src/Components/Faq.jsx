import { useState, useEffect, useRef } from "react";

// Images
import img1 from "/public/faq/Faq11.png";
import img2 from "/public/faq/Faq22.png";
import img3 from "/public/faq/Faq44.png";

export default function DermedicoFAQ() {
  const images = [img1, img2, img3];
  const [current, setCurrent] = useState(0);
  const [openIndex, setOpenIndex] = useState(null);
  const [paused, setPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  /* 🔁 Auto carousel (pause on hover) */
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [paused, images.length]);

  /* 👆 Swipe handling */
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;

    if (diff > 50) {
      setCurrent((prev) => (prev + 1) % images.length);
    } else if (diff < -50) {
      setCurrent((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const faqs = [
    {
      question: "How does Dermedico work?",
      answer:
        "Dermedico delivers dermatologist-developed skincare and haircare solutions using clinically tested ingredients for visible and safe results.",
    },
    {
      question: "Why is skin & hair care important?",
      answer:
        "Consistent care helps maintain healthy skin and hair, prevents premature aging, and reduces acne and pigmentation.",
    },
    {
      question: "How do Dermedico products help?",
      answer:
        "Dermedico products target the root cause of concerns while being gentle enough for daily use.",
    },
  ];

  return (
    <>
      <style>{`
        .faq-section {
          background: #fff;
          padding: 80px 20px;
        }

        .faq-container {
          max-width: 1200px;
          margin: auto;
          display: flex;
          align-items: flex-start; /* 🔥 FIX */
          gap: 80px;
        }

        /* ---------- LEFT CAROUSEL ---------- */
        .carousel {
          flex: 1;
          display: flex;
          flex-direction: column; /* 🔥 FIX */
          align-items: center;
        }

        .carousel img {
          width: 100%;
          max-width: 420px;
          height: auto;
          user-select: none;
          display: block;
        }

        /* ---------- DOTS ---------- */
        .dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 18px;
          width: 100%;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #000;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot.active {
          background: #000;
        }

        /* ---------- RIGHT CONTENT ---------- */
        .faq-content {
          flex: 1.2;
        }

        .faq-content h2 {
          font-size: 36px;
          font-weight: 600;
          margin-bottom: 40px;
        }

        .faq-content h2 span {
          color: #61a8c9;
        }

        .faq-item {
          border-bottom: 1px solid #61a8c9;
          padding: 18px 0;
        }

        .faq-question {
          width: 100%;
          background: none;
          border: none;
          font-size: 18px;
          font-weight: 500;
          display: flex;
          justify-content: space-between;
          cursor: pointer;
        }

        .faq-icon {
          font-size: 28px;
        }

        .faq-answer {
          margin-top: 12px;
          font-size: 15px;
          color: #555;
          line-height: 1.6;
        }

        .assurance {
          margin-top: 40px;
          font-size: 12px;
          letter-spacing: 1px;
          color: #9aa3af;
          font-weight: 600;
        }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 768px) {
          .faq-container {
            flex-direction: column;
            gap: 40px;
          }

          .carousel img {
            max-width: 300px;
          }

          .faq-content h2 {
            font-size: 28px;
          }
        }
      `}</style>

      <section className="faq-section poppins-regular">
        <div className="faq-container">

          {/* LEFT CAROUSEL */}
          <div
            className="carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img src={images[current]} alt="Dermedico product" />

            <div className="dots">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`dot ${current === i ? "active" : ""}`}
                  onClick={() => setCurrent(i)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT FAQ */}
          <div className="faq-content">
            <h2>
              India’s one-stop <span>dermatology</span> destination.
            </h2>

            {faqs.map((faq, index) => (
              <div className="faq-item" key={index}>
                <button
                  className="faq-question"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                >
                  {faq.question}
                  <span className="faq-icon">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>

                {openIndex === index && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}

            <div className="assurance">
              OUR ASSURANCE: ALL Dermedico PRODUCTS ARE OF TOP GRADE QUALITY
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
