import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { BASE_URL } from "../api/axiosConfig";

export default function BlogSection() {

  const [blogs, setBlogs] = useState([]);
  const sliderRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    api.get("/blogs")
      .then(res => {
        setBlogs(res.data);
      })
      .catch(err => console.log(err));
  }, []);

  // First 2 blogs = Featured
  const featuredBlogs = blogs.slice(0,2);

  // Next blogs = Side list
  const sideBlogs = blogs.slice(2,5);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const index = Math.round(
      sliderRef.current.scrollLeft / sliderRef.current.offsetWidth
    );
    setActiveDot(index);
  };

  return (
    <>
      <style>{`
        .blog-section {
          background: #fff;
          padding: 64px 0;
        }

        .blog-inner {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .blog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .blog-header h2 {
          font-size: 32px;
          font-weight: 600;
        }

        .see-all {
          color: #61a8c9;
          text-decoration: none;
          font-weight: 500;
        }

        .blog-grid {
          display: grid;
          grid-template-columns: 2fr 2fr 3fr;
          gap: 28px;
          align-items: start;
        }

        .featured-wrapper {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
          grid-column: span 2;
        }

        .featured-card {
          background: #fff;
          border-radius: 18px;
          padding: 14px;
          border: 1px solid #eee;
          transition: 0.35s ease;
          display: flex;
          flex-direction: column;
          height: 420px;
        }

        .featured-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 14px 32px rgba(0,0,0,0.10);
        }

        .featured-card img {
          width: 100%;
          height: 190px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .blog-date {
          font-size: 14px;
          color: #61a8c9;
          margin-bottom: 6px;
        }

        .featured-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .featured-card p {
          font-size: 15px;
          color: #6b7280;
          margin-bottom: 10px;
        }

        .featured-card .btn {
          padding: 8px 18px;
          border-radius: 30px;
          border: 1.5px solid #61a8c9;
          color: #61a8c9;
          text-decoration: none;
          font-size: 14px;
          width: fit-content;
        }

        .featured-card .btn:hover {
          background: #61a8c9;
          color: #fff;
        }

        .side-list {
          display: flex;
          flex-direction: column;
        }

        .side-item {
          padding: 18px 0;
          border-bottom: 1px solid #eee;
          transition: 0.35s ease;
        }

        .side-item:hover {
          background: #fff;
          padding: 18px;
          border-radius: 18px;
          box-shadow: 0 12px 26px rgba(0,0,0,0.08);
          border-bottom: none;
        }

        .side-item h4 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .side-item p {
          font-size: 14px;
          color: #6b7280;
        }

        .side-cta {
          margin-top: 8px;
          opacity: 0;
          transition: 0.3s ease;
        }

        .side-item:hover .side-cta {
          opacity: 1;
        }

        .side-cta a {
          padding: 8px 18px;
          border-radius: 30px;
          border: 1.5px solid #61a8c9;
          color: #61a8c9;
          text-decoration: none;
          font-size: 14px;
        }

        .dots {
          display: none;
        }

        @media (max-width: 640px) {

          .blog-inner {
            padding: 0 20px;
          }

          .blog-grid {
            display: block;
          }

          .featured-wrapper {
            display:flex;
            overflow-x:auto;
            scroll-snap-type:x mandatory;
          }

          .featured-card{
            min-width:100%;
            height:auto;
            scroll-snap-align:start;
          }

          .dots{
            display:flex;
            justify-content:center;
            gap:6px;
            margin:14px 0 24px;
          }

          .dot{
            width:6px;
            height:6px;
            background:#ccc;
            border-radius:50%;
          }

          .dot.active{
            width:10px;
            height:10px;
            background:#000;
          }

          .side-list{
            display:none;
          }
        }
      `}</style>

      <section className="blog-section poppins-regular">

        <div className="blog-inner">

          <div className="blog-header">

            <h2>From the Doctor’s Desk</h2>

            <Link to="/blogs" className="see-all">
              See all
            </Link>

          </div>


          <div className="blog-grid">

            {/* FEATURED BLOGS */}

            <div
              className="featured-wrapper"
              ref={sliderRef}
              onScroll={handleScroll}
            >

              {featuredBlogs.map(blog => (

                <div className="featured-card" key={blog.id}>

                  <img
                    src={BASE_URL + blog.mainImage}
                    alt={blog.title}
                  />

                  <span className="blog-date">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>

                  <h3>{blog.title}</h3>

                  <p>{blog.subtitle}</p>

                  <Link to={`/blog/${blog.slug}`} className="btn">
                    Read Article
                  </Link>

                </div>

              ))}

            </div>


            {/* SIDE BLOGS */}

            <div className="side-list">

              {sideBlogs.map(blog => (

                <div className="side-item" key={blog.id}>

                  <h4>{blog.title}</h4>

                  <p>{blog.subtitle}</p>

                  <div className="side-cta">

                    <Link to={`/blog/${blog.slug}`}>
                      Read Article
                    </Link>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>
    </>
  );
}