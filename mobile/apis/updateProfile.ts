import { API_BASE_URL } from "@/constants";
import { IUser } from "@/types";
import axiosInstance from "@/utils/axiosInstance";
import { isAxiosError } from "axios";

export const updateProfile = async (userData: Partial<IUser>) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/user/profile`,
      userData
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || "Update failed";
      const status = error.response?.status;

      const err = new Error(message);
      (err as any).status = status;
      throw err;
    }

    throw new Error("Unexpected error occurred");
  }
};
