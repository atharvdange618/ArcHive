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
      type = ContentType.Link;
    } else if (content.text) {
      type = ContentType.Text;
    } else if (content.code) {
      type = ContentType.Code;
    } else {
      throw new Error("Invalid content type");
    }

    const response = await axiosInstance.post("/api/content", { ...content, type });
    return response.data.content;
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
};
