import axios from "axios";
import { getAuthToken, logout } from "../utils/UtilsGlobalData";
import { toast } from "react-toastify";
import { navigateTo } from "../utils/navigation";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Expires: 0,
    Pragma: "no-cache",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    const currentDomainName = localStorage.getItem("domain_name");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (currentDomainName) {
      if (!config.headers["Domain"]) {
        config.headers["Domain"] = currentDomainName;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    toast.success(response?.data?.message, { autoClose: 2000 });
    return response;
  },
  (error) => {
    const errorMessage = error?.response?.data?.message;
    if (
      errorMessage === "Unauthenticated." ||
      errorMessage === "Unauthenticated"
    ) {
      logout();
      navigateTo("/login");
      return Promise.reject(error);
    }
    toast.error(errorMessage);

    if (errorMessage === "Unauthorized") {
      navigateTo("/vendor-portal/login");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      return Promise.reject(error);
    }

    if (errorMessage === "Internal_server") {
      navigateTo("/500-internal-server-error");
      return Promise.reject(error);
    }
    if (errorMessage === "Service Unavailable") {
      navigateTo("/service-unavailable");
      return Promise.reject(error);
    }

    if (error?.code === "ERR_NETWORK") {
      navigateTo("/500-internal-server-error");
    } else {
      console.error("API error:", error?.message);
      return Promise.reject(error);
    }
  }
);

// Reusable API methods
export const getApi = (endpoint, data) => apiClient.get(endpoint, data);
export const postApi = (endpoint, data) => apiClient.post(endpoint, data);
export const putApi = (endpoint, data) => apiClient.put(endpoint, data);
export const deleteApi = (endpoint) => apiClient.delete(endpoint);

export default apiClient;
