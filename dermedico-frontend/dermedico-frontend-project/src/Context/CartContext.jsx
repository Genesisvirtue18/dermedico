

import { createContext, useContext, useEffect, useState } from "react";
import SecureApi from "../api/api";
import { BASE_URL } from "../api/axiosConfig";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);


  /* ================= AUTH CHECK ================= */
  const checkAuth = async () => {
    try {
      await SecureApi.get("/auth/check-auth", { withCredentials: true });
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };




  /* ================= LOAD CART ================= */
  const loadCart = async () => {
    if (isAuthenticated) {
      const res = await SecureApi.get("/cart", { withCredentials: true });
      setCartItems(res.data || []);
    } else {
      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(guestCart);
    }
  };

  /* ================= ADD TO CART ================= */
  const addToCart = async (product, quantity = 1) => {
    // 🔐 Logged-in user → DB
    if (isAuthenticated) {
      await SecureApi.post(
        "/cart/add",
        null,
        {
          params: { productId: product.id, quantity },
          withCredentials: true,
        }
      );
      await loadCart();
      return;
    }

    // 🟢 Guest user → localStorage
    const guestCart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = guestCart.find(
      (item) => item.productId === product.id
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      guestCart.push({
        id: Date.now(),
        productId: product.id,
        quantity,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          mainImage: (
            product.image || product.mainImage || ""
          ).replace(BASE_URL, ""),
          stockQuantity: product.stockQuantity ?? 0,

        },
      });
    }

    localStorage.setItem("cart", JSON.stringify(guestCart));
    setCartItems(guestCart); // 🔥 navbar updates instantly
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    try {
      await SecureApi.post("/auth/logout", null, { withCredentials: true });
    } catch { }
    setIsAuthenticated(false);
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const increaseQty = async (cartItem) => {
    if (!cartItem?.id || typeof cartItem.quantity !== "number") {
      console.error("Invalid cartItem", cartItem);
      return;
    }

    if (isAuthenticated) {
      await SecureApi.put(
        `/cart/${cartItem.id}`,
        null,
        {
          params: { quantity: cartItem.quantity + 1 }, // ✅ NUMBER
          withCredentials: true,
        }
      );

      await loadCart();
      return;
    }

    // 🟢 Guest cart
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const updated = cart.map(item =>
      item.id === cartItem.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated);
  };


  const decreaseQty = async (cartItem) => {
    if (!cartItem?.id || cartItem.quantity <= 1) return;

    if (isAuthenticated) {
      await SecureApi.put(
        `/cart/${cartItem.id}`,
        null,
        {
          params: { quantity: cartItem.quantity - 1 },
          withCredentials: true,
        }
      );
      await loadCart();
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const updated = cart.map(item =>
      item.id === cartItem.id
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );

    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated);
  };


  const removeItem = async (cartItemId) => {
    if (isAuthenticated) {
      await SecureApi.delete(`/cart/${cartItemId}`, {
        withCredentials: true,
      });
      await loadCart();
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const updated = cart.filter(item => item.id !== cartItemId);

    localStorage.setItem("cart", JSON.stringify(updated));
    setCartItems(updated);
  };


  /* ================= INIT ================= */
  useEffect(() => {
  const init = async () => {
    await checkAuth();   // checks cookie
    setAuthReady(true);  // 🔥 tells app auth is ready
    setLoading(false);
  };
  init();
}, []);

 useEffect(() => {
  if (!authReady) return;
  loadCart();
}, [authReady, isAuthenticated]);


  return (
    <CartContext.Provider
      value={{
        cartItems,
        isAuthenticated,
        loadCart,
        addToCart,  
        checkAuth,   // ✅ ADD THIS
        authReady,
        increaseQty,
        decreaseQty,
        removeItem,
        logout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
