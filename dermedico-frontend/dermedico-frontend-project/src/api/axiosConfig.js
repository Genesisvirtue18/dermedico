import axios from "axios";

//export const BASE_URL = "http://localhost:8080"; // ✅ image + file base
export const BASE_URL = "https://apis.dermedicostore.in"; // ✅ image + file base


const api = axios.create({
 // baseURL: "http://localhost:8080/api", // ✅ Common base URL
   baseURL: "https://apis.dermedicostore.in/api", // ✅ Common base URL

  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
