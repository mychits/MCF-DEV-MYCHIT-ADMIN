import axios from "axios";
const token = localStorage.getItem("Token");
const api = axios.create({
    // baseUrl: "https://mychits.online/api",
    // baseURL: "http://51.21.197.152:3000/api",
      baseURL: "http://localhost:3000/api",
      
  headers: {
    Authorization: `Bearer ${token}`,
  
  },
});

export default api;
