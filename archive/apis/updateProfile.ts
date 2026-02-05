import { IUser } from "@/types";
import axiosInstance from "@/utils/axiosInstance";
import { isAxiosError } from "axios";

export const updateProfile = async (userData: Partial<IUser>) => {
  try {
    const response = await axiosInstance.put(
      `/api/user/profile`,
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

export const uploadProfilePicture = async (imageUri: string) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename || "");
    const type = match ? `image/${match[1]}` : `image`;

    formData.append("profilePicture", {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await axiosInstance.put(
      `/api/user/profile-picture`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || "Upload failed";
      const status = error.response?.status;

      const err = new Error(message);
      (err as any).status = status;
      throw err;
    }

    throw new Error("Unexpected error occurred");
  }
};
