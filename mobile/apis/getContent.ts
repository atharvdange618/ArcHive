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

export const getContent = async (query?: string): Promise<ApiResponse> => {
  const endpoint = query ? `/content?q=${query}` : "/content";
  try {
    const response = await axiosInstance.get<ApiResponse>(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
};
