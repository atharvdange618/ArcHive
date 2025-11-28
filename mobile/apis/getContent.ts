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
  limit: number = 20,
  type?: string
): Promise<ApiResponse> => {
  let endpoint = `/content?page=${page}&limit=${limit}`;

  if (query) {
    endpoint += `&q=${query}`;
  }

  if (type) {
    endpoint += `&type=${type}`;
  }

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
    const response = await axiosInstance.get<{ content: IContentItem }>(
      `/content/${id}`
    );
    return response.data.content;
  } catch (error) {
    console.error(`Error fetching content with ID ${id}:`, error);
    throw error;
  }
};
