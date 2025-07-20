
import { ContentType, IContentItem } from "@/types";
import axiosInstance from "../utils/axiosInstance";

export const createContent = async (
  content: Partial<IContentItem> & { type: ContentType }
): Promise<IContentItem> => {
  try {
    const response = await axiosInstance.post("/content", content);
    return response.data.content;
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
};
