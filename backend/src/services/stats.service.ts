import ContentItem from "../db/models/ContentItem";
import { AppError } from "../utils/errors";
import mongoose from "mongoose";

export async function getUserStats(userId: string) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get total count
    const totalCount = await ContentItem.countDocuments({
      userId: userObjectId,
    });

    // Get counts by type
    const countsByType = await ContentItem.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCount = await ContentItem.countDocuments({
      userId: userObjectId,
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get most used tags (top 5)
    const topTags = await ContentItem.aggregate([
      { $match: { userId: userObjectId } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get oldest and newest content dates
    const oldestContent = await ContentItem.findOne({ userId: userObjectId })
      .sort({ createdAt: 1 })
      .select("createdAt");

    const newestContent = await ContentItem.findOne({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .select("createdAt");

    // Format counts by type
    const typeStats = {
      link: 0,
      text: 0,
      code: 0,
    };

    countsByType.forEach((item) => {
      if (item._id in typeStats) {
        typeStats[item._id as keyof typeof typeStats] = item.count;
      }
    });

    return {
      totalItems: totalCount,
      byType: typeStats,
      recentActivity: recentCount,
      topTags: topTags.map((tag) => ({
        name: tag._id,
        count: tag.count,
      })),
      firstItemDate: oldestContent?.createdAt || null,
      lastItemDate: newestContent?.createdAt || null,
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw new AppError(500, "Failed to retrieve user statistics.");
  }
}
