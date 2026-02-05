import { IUser } from "@/types";
import axiosInstance from "@/utils/axiosInstance";
import { isAxiosError } from "axios";

export const getUserProfile = async (): Promise<IUser> => {
  try {
    const response = await axiosInstance.get<{ user: IUser }>(`/api/user/profile`);
    return response.data.user;
  } catch (error) {
    if (isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch user profile";
      const status = error.response?.status;

      const err = new Error(message);
      (err as any).status = status;
      throw err;
    }

    throw new Error("Unexpected error occurred while fetching user profile");
  }
};
