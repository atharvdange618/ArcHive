import axiosInstance from "../utils/axiosInstance";
import { PlatformStat } from "../types";

export const getPlatforms = async (): Promise<PlatformStat[]> => {
  const response = await axiosInstance.get("/api/content/platforms");
  return response.data.platforms;
};
