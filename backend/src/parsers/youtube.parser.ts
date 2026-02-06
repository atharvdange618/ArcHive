import { google } from "googleapis";
import { AppError } from "../utils/errors";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

/**
 * Helper to extract the Video ID from various YouTube URL formats.
 * Handles:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
const extractVideoId = (url: string): string | null => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/shorts\/))([\w-]{11})/,
  );
  return match ? match[1] : null;
};

/**
 * Parses a YouTube URL to extract video details using YouTube Data API v3.
 * @param url The YouTube video URL.
 * @returns A promise that resolves to an object conforming to the link content type.
 */
export const youtubeParser = async (url: string) => {
  try {
    const videoId = extractVideoId(url);

    if (!videoId) {
      throw new AppError(
        400,
        "Invalid YouTube URL format. Could not extract Video ID.",
      );
    }

    // Check if API key is configured
    if (!process.env.YOUTUBE_API_KEY) {
      console.error("YOUTUBE_API_KEY not configured");
      throw new Error("YouTube API key not configured");
    }

    // Fetch video details from YouTube Data API
    const response = await youtube.videos.list({
      part: ["snippet"],
      id: [videoId],
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new AppError(404, "YouTube video not found or unavailable");
    }

    const video = response.data.items[0];
    const snippet = video.snippet!;

    // Get the best quality thumbnail
    const thumbnail =
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      "";

    return {
      type: "link",
      title: snippet.title || "YouTube Video",
      description: "",
      url: url,
      previewImageUrl: thumbnail,
    };
  } catch (error: any) {
    console.error(`Failed to parse YouTube URL ${url}:`, error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error.message && error.message.includes("Video unavailable")) {
      throw new AppError(404, "YouTube video is unavailable or private.");
    }

    throw new AppError(500, `Failed to process YouTube URL: ${url}`);
  }
};
