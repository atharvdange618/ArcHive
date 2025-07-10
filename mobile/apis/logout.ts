import axiosInstance from "@/utils/axiosInstance";
import { isAxiosError } from "axios";

export const logout = async (refreshToken: string) => {
  try {
    const response = await axiosInstance.post(`/auth/logout`, { refreshToken });

    return response.data;
  } catch (error: any) {
    if (isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || "Logout failed";
      const status = error.response?.status;

      const err = new Error(message);
      (err as any).status = status;
      throw err;
    }

    throw new Error("Unexpected error occurred");
  }
};
