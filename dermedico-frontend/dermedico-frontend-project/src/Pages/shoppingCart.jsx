import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useCart } from "../Context/CartContext";


export default function ShoppingCart() {
  const navigate = useNavigate();
  const { cartItems, loadCart, isAuthenticated, increaseQty,
  decreaseQty,
  removeItem,authReady } = useCart();



  // const loadCart = async () => {
  //   try {
  //     console.log("➡️ Fetching Cart...");
  //     const response = await api.get("/cart");
  //     console.log("✅ API Response:", response.data);
  //     setCartItems(response.data);
  //   } catch (error) {
  //     console.error("❌ Error loading cart", error);
  //   }
  // };




 useEffect(() => {
  if (!authReady) return;
  loadCart();
}, [authReady]);

  // const handleIncrease = async (cartItemId, currentQty) => {
  //   if (isAuthenticated) {
  //     const response = await api.put(
  //       `/cart/${cartItemId}?quantity=${currentQty + 1}`,
  //       null,
  //       { withCredentials: true }
  //     );
  //     updateItemInUI(response.data);
  //   } else {
  //     const updated = cartItems.map(item =>
  //       item.id === cartItemId
  //         ? { ...item, quantity: item.quantity + 1 }
  //         : item
  //     );

  //     setCartItems(updated);
  //     localStorage.setItem("cart", JSON.stringify(updated));
  //   }
  // };



  // const handleDecrease = async (cartItemId, currentQty) => {
  //   if (currentQty <= 1) return;

  //   if (isAuthenticated) {
  //     const response = await api.put(
  //       `/cart/${cartItemId}?quantity=${currentQty - 1}`,
  //       null,
  //       { withCredentials: true }
  //     );
  //     updateItemInUI(response.data);
  //   } else {
  //     const updated = cartItems
  //       .map(item =>
  //         item.id === cartItemId
  //           ? { ...item, quantity: item.quantity - 1 }
  //           : item
  //       )
  //       .filter(item => item.quantity > 0);

  //     setCartItems(updated);
  //     localStorage.setItem("cart", JSON.stringify(updated));
  //   }
  // };


  const updateItemInUI = (updatedItem) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id
          ? { ...item, quantity: updatedItem.quantity }
          : item
      )
    );
  };

const handleIncrease = (item) => {
  console.log("handleIncrease item:", item);
  increaseQty(item);
};


const handleDecrease = (item) => {
  decreaseQty(item);
};


const handleRemove = (id) => {
  removeItem(id);
};


// const handleRemove = async (cartItemId) => {
//   if (isAuthenticated) {
//     await api.delete(`/cart/${cartItemId}`, { withCredentials: true });
//   } else {
//     const updated = cartItems.filter(item => item.id !== cartItemId);
//     localStorage.setItem("cart", JSON.stringify(updated));
//   }

//   loadCart(); // ✅ updates CartContext → Navbar updates
// };




  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const total = subtotal;

  return (
    <>
      <Navbar />
      <section className="flex flex-col lg:flex-row justify-between max-w-7xl mx-auto mt-4 sm:mt-8 lg:mt-16 mb-10 sm:mb-16 lg:mb-20 px-4 sm:px-6 poppins-regular">
        {/* LEFT SIDE - Cart Items */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-10 pb-3 sm:pb-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1E1E1E] tracking-tight">
              Shopping Cart
            </h2>
            <p className="text-xs sm:text-sm text-[#777] font-medium">
              {cartItems.length} {cartItems.length === 1 ? "ITEM" : "ITEMS"}
            </p>
          </div>

          {/* Desktop Table Header - Hidden on mobile */}
          <div className="hidden lg:grid grid-cols-6 text-sm text-[#888] pb-4 mb-6 border-b border-gray-100">
            <span className="col-span-2 pl-4">Item</span>
            <span>Size</span>
            <span className="text-center">Quantity</span>
            <span className="text-center">Price</span>
            <span className="text-right pr-4">Remove</span>
          </div>

          {/* Cart Items */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12 lg:py-16">
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 bg-[#6BB9C9] text-white px-6 py-2 rounded-md hover:bg-[#5aa7b7] transition"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id}>
                  {/* Desktop View */}
                  <div className="hidden lg:grid grid-cols-6 items-center pb-6 lg:pb-8 text-sm text-[#1E1E1E] border-b border-gray-100">
                    {/* Product */}
                    <div className="col-span-2 flex items-center gap-4 pl-4">
                      <img
                        src={`${BASE_URL}${item.product.mainImage}`}
                        alt={item.product.name}
                        className="w-14 h-16 lg:w-16 lg:h-20 object-contain"
                      />
                      <div>
                        <h4 className="text-[14px] lg:text-[15px] font-medium mb-1">
                          {item.product.name}
                        </h4>
                        <p className="text-[#888] text-[12px] lg:text-[13px]">
                          Stock: {item.product.stockQuantity}
                        </p>
                      </div>
                    </div>

                    {/* Size */}
                    <div className="text-[14px] text-[#555]">50 ml</div>

                    {/* Quantity */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center rounded-md bg-white border border-gray-200">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="px-3 py-1 text-[16px] text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 min-w-[40px] text-center border-l border-r border-gray-200">
                          {item.quantity}
                        </span>
                        <button
onClick={() => handleIncrease(item)}
                          className="px-3 py-1 text-[16px] text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-center font-semibold text-[15px]">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove */}
                    <div className="flex justify-end items-center pr-4">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="lg:hidden bg-white rounded-lg border border-gray-200 p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={`${BASE_URL}${item.product.mainImage}`}
                          alt={item.product.name}
                          className="w-12 h-14 sm:w-14 sm:h-16 object-contain"
                        />
                        <div className="flex-1">
                          <h4 className="text-[14px] sm:text-[15px] font-medium text-[#1E1E1E] mb-1">
                            {item.product.name}
                          </h4>
                          <p className="text-[12px] sm:text-[13px] text-[#888] mb-1">
                            Size: 50 ml
                          </p>
                          <p className="text-[12px] sm:text-[13px] text-[#888]">
                            Stock: {item.product.stockQuantity}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors text-lg sm:text-xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center rounded-md bg-white border border-gray-200">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="px-3 py-1 sm:px-4 sm:py-2 text-[14px] sm:text-[16px] text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 sm:px-4 sm:py-2 min-w-[30px] sm:min-w-[40px] text-center border-l border-r border-gray-200 text-[14px] sm:text-[16px]">
                          {item.quantity}
                        </span>
                        <button
onClick={() => handleIncrease(item)}
                          className="px-3 py-1 sm:px-4 sm:py-2 text-[14px] sm:text-[16px] text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[14px] sm:text-[15px] text-[#1E1E1E]">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-[12px] sm:text-[13px] text-[#888]">
                          ₹{item.product.price} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDE - Order Summary */}
        <div className="w-full lg:w-[320px] bg-[#F7F7F7] p-4 sm:p-6 rounded-lg mt-6 lg:mt-0 lg:ml-8 xl:ml-10 sticky bottom-0 lg:relative bg-white lg:bg-[#F7F7F7] border-t lg:border-t-0 border-gray-200 lg:border-0">
          <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4 sm:mb-5 pb-2 border-b border-gray-300">
            Order Summary
          </h3>

          <div className="space-y-2 text-sm text-gray-600 mb-4 sm:mb-5">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="font-medium text-[#1E1E1E]">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            {/* Add shipping, taxes, etc. here if needed */}
          </div>

          <div className="flex justify-between items-center text-base font-semibold text-[#1E1E1E] mb-4 sm:mb-5 pt-3 border-t border-gray-300">
            <span>Total</span>
            <span className="text-lg">₹{total.toFixed(2)}</span>
          </div>

          <button
            onClick={() => {
              if (cartItems.length === 0) {
                alert("Your cart is empty!");
                return;
              }
              if (!isAuthenticated) {
                navigate("/login", { state: { from: "/checkout" } });
              } else {
                navigate("/checkout");
              }
            }}
            className="w-full bg-[#6BB9C9] text-white font-medium py-3 rounded-md hover:bg-[#5aa7b7] transition text-[15px] disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={cartItems.length === 0}
          >
            {cartItems.length === 0 ? "Cart is Empty" : "Proceed to Checkout"}
          </button>

          {cartItems.length > 0 && (
            <button
              onClick={() => navigate("/")}
              className="w-full mt-3 bg-transparent border border-[#6BB9C9] text-[#6BB9C9] font-medium py-3 rounded-md hover:bg-[#6BB9C9] hover:text-white transition text-[15px]"
            >
              Continue Shopping
            </button>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}