/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    safelist: [
    "font-manrope"
  ],

  theme: {
    extend: {
      fontFamily: {
        kdam: ["Kdam Thmor", "sans-serif"],
        manrope: ['Manrope', 'sans-serif'],
        antic: ["Antic Didone", "serif"],
        josefin: ["Josefin Slab", "serif"],
      },
      colors: {
        brand: "#000D17",
      },
    },
  },
  plugins: [],
};
