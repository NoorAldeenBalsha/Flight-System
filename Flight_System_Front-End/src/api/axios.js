// src/api/axios.js
import axios from "axios";

// قاعدة API
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // مهم إذا الريفرش توكن في httpOnly cookie
});

// طلب قبل الإرسال لإضافة Access Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

// التعامل مع استجابة خطأ 401 وتجديد Access Token
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.get("http://localhost:5000/api/user/refresh-token", {
          withCredentials: true, // مهم إذا الريفرش توكن موجود بالكوكي
        });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        // إعادة المحاولة للطلب الأصلي بعد تجديد الـ token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (err) {
        // إذا فشل الريفرش توكن: تسجيل خروج أو إعادة توجيه للـ login
        localStorage.removeItem("accessToken");
        window.location.href = "/auth";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;