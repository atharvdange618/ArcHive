import axiosInstance from "@/utils/axiosInstance";
import { isAxiosError } from "axios";

export const register = async ({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  const payload = { email, password, firstName, lastName };

  try {
    const response = await axiosInstance.post(`/auth/register`, payload);

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
