import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DJANGO_API_URL,
});

export default axiosInstance;
