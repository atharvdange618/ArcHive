import { ContentType, IContentItem } from "@/types";
import axiosInstance from "../utils/axiosInstance";

export const createContent = async (content: {
  url?: string;
  text?: string;
  code?: string;
  language?: string;
  title?: string;
  description?: string;
  tags?: string[];
}): Promise<IContentItem> => {
  try {
    let type: ContentType;
    if (content.url) {
      type = ContentType.LINK;
    } else if (content.text) {
      type = ContentType.TEXT;
    } else if (content.code) {
      type = ContentType.CODE;
    } else {
      throw new Error("Invalid content type");
    }

    const response = await axiosInstance.post("/content", { ...content, type });
    return response.data.content;
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
};
