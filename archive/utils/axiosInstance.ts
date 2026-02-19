import axios from "axios";
import { API_BASE_URL } from "@/constants";
import * as SecureStore from "expo-secure-store";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupAxiosInterceptors = (
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>,
  logout: () => Promise<void>,
) => {
  axiosInstance.interceptors.request.use(
    async (config) => {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (
        originalRequest._retry ||
        originalRequest.url?.includes("/api/auth/refresh") ||
        !error.response
      ) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401) {
        originalRequest._retry = true;

        try {
          const refreshToken = await SecureStore.getItemAsync("refreshToken");

          if (!refreshToken) {
            await logout();
            return Promise.reject(error);
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken },
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data;

          if (!newAccessToken || !newRefreshToken) {
            console.error("Invalid refresh response, missing tokens");
            await logout();
            return Promise.reject(error);
          }

          await setTokens(newAccessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError: any) {
          console.error(
            "Token refresh failed:",
            refreshError?.response?.data || refreshError.message,
          );
          await logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
};

export default axiosInstance;
