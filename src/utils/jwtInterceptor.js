import axios from "axios";
import { clearAuth, getToken } from "@/lib/auth";

let attached = false;

function jwtInterceptor() {
  if (attached || typeof window === "undefined") {
    return;
  }
  attached = true;

  axios.interceptors.request.use((req) => {
    const token = getToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const requestUrl = `${req.baseURL ?? ""}${req.url ?? ""}`;

    // geoth ไม่รับ Authorization — ถ้าใส่แล้วเบราว์เซอร์จะ preflight แล้วโดน CORS
    if (token && apiUrl && requestUrl.startsWith(apiUrl)) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  });

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const errorMessage = error.response?.data?.error;
      if (
        error.response?.status === 401 &&
        typeof errorMessage === "string" &&
        errorMessage.includes("Unauthorized")
      ) {
        clearAuth();
        window.location.replace("/login");
      }
      return Promise.reject(error);
    },
  );
}

export default jwtInterceptor;
