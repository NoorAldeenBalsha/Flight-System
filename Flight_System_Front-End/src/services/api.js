import axios from "axios";

const API_BASE_URL = "https://flight-system-3nfs.onrender.com/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/* =========================
   REQUEST
========================= */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =========================
   RESPONSE
========================= */
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await API.get("/user/refresh-token");

        localStorage.setItem("accessToken", res.data.accessToken);
        originalRequest.headers.Authorization =
          `Bearer ${res.data.accessToken}`;

        return API(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;