import axios from "axios";
const token = localStorage.getItem("Token");
import BaseURL from "./BaseUrl";
const api = axios.create({
  baseURL:BaseURL,

  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default api;
