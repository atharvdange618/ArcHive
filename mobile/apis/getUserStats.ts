import axiosInstance from "@/utils/axiosInstance";

export interface UserStats {
  totalItems: number;
  byType: {
    link: number;
    text: number;
    code: number;
  };
  recentActivity: number;
  topTags: Array<{
    name: string;
    count: number;
  }>;
  firstItemDate: string | null;
  lastItemDate: string | null;
}

export const getUserStats = async (): Promise<UserStats> => {
  const response = await axiosInstance.get("/user/stats");
  return response.data.stats;
};
