import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = "https://4bhw4zcd-3000.inc1.devtunnels.ms/api"; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // needed if your backend uses cookies
});

// Attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
