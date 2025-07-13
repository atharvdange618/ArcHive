import axiosInstance from "../utils/axiosInstance";
import { IContentItem } from "../types";

export interface ApiResponse {
  message: string;
  data: IContentItem[];
  meta: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getContent = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>("/content");
    return response.data;
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
};
