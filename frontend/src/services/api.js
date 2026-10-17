
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
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
