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

export const getContent = async (
  query?: string,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse> => {
  const endpoint = query
    ? `/content?q=${query}&page=${page}&limit=${limit}`
    : `/content?page=${page}&limit=${limit}`;
  try {
    const response = await axiosInstance.get<ApiResponse>(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching content:", error);
    throw error;
  }
};

export const getContentById = async (id: string): Promise<IContentItem> => {
  try {
    const response = await axiosInstance.get<{ content: IContentItem }>(`/content/${id}`);
    return response.data.content;
  } catch (error) {
    console.error(`Error fetching content with ID ${id}:`, error);
    throw error;
  }
};
