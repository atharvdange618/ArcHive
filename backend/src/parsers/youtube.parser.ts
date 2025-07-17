import { genericParser } from "./generic.parser";

/**
 * Parses a YouTube URL to extract video details.
 * It fetches the HTML of the YouTube page and scrapes the Open Graph (og) meta tags
 * to get the title, description, and thumbnail image.
 *
 * @param url The YouTube video URL.
 * @returns A promise that resolves to an object conforming to the link content type,
 *          or null if parsing fails.
 */
export const youtubeParser = async (url: string) => {
  return genericParser(url, {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  });
};
