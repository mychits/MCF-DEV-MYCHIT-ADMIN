import axios from "axios";
const token = localStorage.getItem("Token");
const api = axios.create({
  // baseURL: "http://13.48.115.111:3000/api",
  baseURL: "http://localhost:3000/api",

  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default api;
