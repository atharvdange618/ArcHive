import axiosInstance from "../utils/axiosInstance";

export const deleteContent = async (contentId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/content/${contentId}`);
  } catch (error) {
    console.error("Error deleting content:", error);
    throw error;
  }
};
