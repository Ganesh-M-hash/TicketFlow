
import axios from "axios";
import demoApiAdapter from "./demoApi";

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  ...(isDemoMode ? { adapter: demoApiAdapter } : {}),
});

api.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(sessionStorage.getItem("ticketflow.auth"));
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch {
    sessionStorage.removeItem("ticketflow.auth");
  }

  return config;
});

export default api;
