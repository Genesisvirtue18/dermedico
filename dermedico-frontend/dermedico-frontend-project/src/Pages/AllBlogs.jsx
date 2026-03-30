import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const AllBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        api.get("/blogs")
            .then((res) => {
                setBlogs(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fffdf7]" style={{ fontFamily: "Manrope" }}>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="animate-pulse">
                        <div className="h-10 w-64 rounded bg-[#e9dfc6] mb-4" />
                        <div className="h-5 w-full max-w-2xl rounded bg-[#efe8d7] mb-12" />
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="rounded-3xl overflow-hidden border border-[#eadfc6] bg-white">
                                    <div className="h-52 bg-[#efe8d7]" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 w-24 rounded bg-[#efe8d7]" />
                                        <div className="h-6 w-11/12 rounded bg-[#e9dfc6]" />
                                        <div className="h-4 w-full rounded bg-[#f2ecdd]" />
                                        <div className="h-4 w-4/5 rounded bg-[#f2ecdd]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Manrope" }}>

            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Title */}

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Blogs
                    </h1>

                    <p className="text-gray-500 mt-1 text-sm">
                        Latest skincare articles and medical guides
                    </p>

                </div>


                {blogs.length === 0 ? (

                    <div className="text-center py-20 bg-white rounded-xl border">

                        <h2 className="text-xl font-semibold text-gray-700">
                            No blogs available
                        </h2>

                    </div>

                ) : (

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">

                        {blogs.map((blog) => (

                            <div
                                key={blog.id}
                                onClick={() => navigate(`/blog/${blog.slug}`)}
                                className="cursor-pointer bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-md transition"
                            >

                                {/* Image */}

                                <div className="p-4">
                                    <img
                                        src={BASE_URL + blog.mainImage}
                                        alt={blog.title}
                                        className="w-full h-48 object-cover rounded-xl"
                                    />
                                </div>

                                {/* Content */}

                                <div className="p-4">

                                    {/* Category */}

                                    <span className="text-sm text-gray font-medium">

                                        {blog.category?.name || "Skincare"}

                                    </span>


                                    {/* Title */}

                                    <h2 className="text-lg font-semibold text-gray-900 mt-1 line-clamp-2">

                                        {blog.title}

                                    </h2>


                                    {/* Subtitle */}

                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">

                                        {blog.subtitle}

                                    </p>


                                    {/* Footer */}

                                    <div className="flex justify-between items-center mt-4 text-xs text-gray-500">

                                        <span>

                                            {blog.authorName || "DermRange"}

                                        </span>


                                        <span>

                                            {new Date(blog.createdAt).toLocaleDateString()}

                                        </span>

                                    </div>


                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

            <Footer />

        </div>
    );
};

export default AllBlogs;
