import axios from "axios";
const token = localStorage.getItem("Token");
const api = axios.create({
   baseURL: "http://51.21.197.152:3000/api",
  //  baseUrl: "http://mychits.online/api",
    //  baseURL: "http://localhost:3000/api",
  headers: {
    Authorization: `Bearer ${token}`,
  
  },
});

export default api;
