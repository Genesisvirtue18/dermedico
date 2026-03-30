import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api/api";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

export default function SingleProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();
  const PAGE_SIZE = 12;

  useEffect(() => {
    fetchProducts(page);
    // eslint-disable-next-line
  }, [page]);

  const fetchProducts = async (pageNumber) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/products/single?page=${pageNumber}&size=${PAGE_SIZE}`
      );

      setProducts(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5; // show max 5 page numbers

    let start = Math.max(0, page - 2);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-4 py-2 rounded-md ${
            i === page
              ? "bg-black text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex poppins-regular flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl poppins-regular font-bold mb-8 text-gray-900 text-center">
          Our Products
        </h1>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-2xl group"
            >
              <div className="relative p-4 aspect-square">
                <img
                  src={
                    product.mainImage
                      ? `${BASE_URL}${product.mainImage}`
                      : "/placeholder.png"
                  }
                  alt={product.name}
                  className="w-full h-full rounded-xl object-cover"
                />

                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <p className="text-white font-semibold text-lg">
                    View Details
                  </p>
                </div>
              </div>

              <div className="p-4">
                <h2 className="text-gray-900 font-semibold text-sm mb-2 text-center">
                  {product.name}
                </h2>

                {product.price && (
                  <p className="text-green-600 font-bold text-center">
                    ₹{product.price}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Prev
          </button>

          {renderPagination()}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {loading && (
          <div className="flex justify-center mt-10 text-gray-500">
            Loading products...
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
