import { API_BASE_URL } from "@/constants";
import axiosInstance from "@/utils/axiosInstance";
import { isAxiosError } from "axios";

export const register = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  const payload = { username, email, password };

  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/auth/register`,
      payload
    );

    return response.data;
  } catch (error: any) {
    if (isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      const status = error.response?.status;

      const err = new Error(message);
      (err as any).status = status;
      throw err;
    }

    throw new Error("Unexpected error occurred");
  }
};
