import axiosInstance from "@/utils/axiosInstance";
import { isAxiosError } from "axios";

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const payload = { email, password };

  try {
    const response = await axiosInstance.post(`/api/auth/login`, payload);

    return response.data;
  } catch (error: any) {
    if (isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      const status = error.response?.status;

      const err = new Error(message);
      (err as any).status = status;
      throw err;
    }

    throw new Error("Unexpected error occurred");
  }
};
