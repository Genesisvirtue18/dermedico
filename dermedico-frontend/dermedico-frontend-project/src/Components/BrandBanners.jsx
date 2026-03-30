// import { useState } from "react";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import Img1 from "/public/images/brandbanner1.png";
// import Img2 from "/public/images/brandbanner2.png";
// const banners = [
//   {
//     id: 1,
//     image: Img1,
//     link: "/brands/cerave",
//   },
//   {
//     id: 2,
//     image: Img2,
//     link: "/brands/another",
//   },
// ];

// export default function BrandBanners() {
//   const [active, setActive] = useState(0);

//   const prev = () =>
//     setActive((p) => (p === 0 ? banners.length - 1 : p - 1));
//   const next = () =>
//     setActive((p) => (p === banners.length - 1 ? 0 : p + 1));

//   return (
//     <>
//       <style>{`
//         .brand-banner-section {
//           width: 100%;
//           background: #fff;
//           padding: 30px 0 40px;
//         }

//         .brand-banner-container {
//           max-width: 1380px;
//           margin: 0 auto;
//           padding: 0 40px;
//         }

//         .brand-banner {
//           border-radius: 16px;
//           overflow: hidden;
//         }

//         .brand-banner img {
//           width: 100%;
//           display: block;
//           border-radius: 16px;
//         }

//         /* CONTROLS ROW (ARROWS + DOTS) */
//         .banner-controls {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 18px;
//           margin-top: 16px;
//         }

//         .banner-arrow {
//           background: none;
//           border: none;
//           font-size: 20px;
//           cursor: pointer;
//           color: #000;
//           display: flex;
//           align-items: center;
//         }

//         /* DOTS */
//         .banner-dots {
//           display: flex;
//           align-items: center;
//           gap: 14px;
//         }

//         .dot {
//           width: 6px;
//           height: 6px;
//           background: #000;
//           border-radius: 50%;
//           opacity: 0.6;
//         }

//         /* ACTIVE DOT → HOLLOW CIRCLE WITH INNER DOT */
//         .dot.active {
//           width: 14px;
//           height: 14px;
//           border: 1.5px solid #000;
//           background: transparent;
//           opacity: 1;
//           position: relative;
//         }

//         .dot.active::after {
//           content: "";
//           width: 6px;
//           height: 6px;
//           background: #000;
//           border-radius: 50%;
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//         }

//         /* RESPONSIVE */
//         @media (max-width: 768px) {
//           .brand-banner-container {
//             padding: 0 16px;
//           }

//           .banner-arrow {
//             font-size: 18px;
//           }
//         }
//       `}</style>

//       <section className="brand-banner-section">
//         <div className="brand-banner-container">
//           {/* BANNER IMAGE */}
//           <div className="brand-banner">
//             <a href={banners[active].link}>
//               <img src={banners[active].image} alt="Brand Banner" />
//             </a>
//           </div>

//           {/* CONTROLS */}
//           <div className="banner-controls">
//             <button className="banner-arrow" onClick={prev}>
//               <FaChevronLeft />
//             </button>

//             <div className="banner-dots">
//               {banners.map((_, i) => (
//                 <span
//                   key={i}
//                   className={`dot ${i === active ? "active" : ""}`}
//                 />
//               ))}
//             </div>

//             <button className="banner-arrow" onClick={next}>
//               <FaChevronRight />
//             </button>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import api, { BASE_URL } from "../api/axiosConfig";

export default function BrandBanners() {

  const [banners,setBanners]=useState([]);
  const [active,setActive]=useState(0);


  // Fetch banners from API
  useEffect(()=>{

    api.get("/banner")
    .then(res=>{
      setBanners(res.data);
    })
    .catch(err=>{
      console.log(err);
    });

  },[]);



  const prev=()=>{

    setActive(p=>
      p===0?banners.length-1:p-1
    );

  };


  const next=()=>{

    setActive(p=>
      p===banners.length-1?0:p+1
    );

  };


  if(banners.length===0) return null;



  return (
    <>
      <style>{`

        .brand-banner-section {
          width: 100%;
          background: #fff;
          padding: 30px 0 40px;
        }

        .brand-banner-container {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .brand-banner {
          border-radius: 16px;
          overflow: hidden;
        }

        .brand-banner img {
          width: 100%;
          display: block;
          border-radius: 16px;
        }

        .banner-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin-top: 16px;
        }

        .banner-arrow {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #000;
          display: flex;
          align-items: center;
        }

        .banner-dots {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: #000;
          border-radius: 50%;
          opacity: 0.6;
        }

        .dot.active {
          width: 14px;
          height: 14px;
          border: 1.5px solid #000;
          background: transparent;
          opacity: 1;
          position: relative;
        }

        .dot.active::after {
          content: "";
          width: 6px;
          height: 6px;
          background: #000;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        @media (max-width: 768px) {

          .brand-banner-container {
            padding: 0 16px;
          }

          .banner-arrow {
            font-size: 18px;
          }

        }

      `}</style>

      <section className="brand-banner-section">

        <div className="brand-banner-container">

          {/* Banner Image */}
          <div className="brand-banner">

              <img
                src={BASE_URL + banners[active].image}
                alt="Brand Banner"
              />

          </div>


          {/* Controls */}
          <div className="banner-controls">

            <button
              className="banner-arrow"
              onClick={prev}
            >
              <FaChevronLeft/>
            </button>



            <div className="banner-dots">

              {banners.map((_,i)=>(
                <span
                  key={i}
                  className={`dot ${
                    i===active?"active":""
                  }`}
                />
              ))}

            </div>



            <button
              className="banner-arrow"
              onClick={next}
            >
              <FaChevronRight/>
            </button>


          </div>

        </div>

      </section>

    </>
  );

}
