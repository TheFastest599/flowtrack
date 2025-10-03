import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true, // Include cookies for refresh token
});

// Interceptor to add auth token
axiosInstance.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { axiosInstance as axios };
