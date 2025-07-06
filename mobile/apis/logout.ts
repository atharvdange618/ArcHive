import { API_BASE_URL } from "@/constants";
import axios, { isAxiosError } from "axios";

export const logout = async (accessToken: string, refreshToken: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/logout`,
      { refreshToken },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

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
