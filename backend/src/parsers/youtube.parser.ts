
import axios from "axios";
import * as cheerio from "cheerio";

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
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") || $("title").text();
    const description =
      $('meta[property="og:description"]').attr("content") ||
      "No description found.";
    const previewImageUrl = $('meta[property="og:image"]').attr("content");

    return {
      type: "link",
      title: title.trim(),
      description: description.trim(),
      url: url,
      content: url, // Per the schema, content holds the URL for links
      previewImageUrl: previewImageUrl || undefined,
    };
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
    // Fallback to generic parser or return null if axios fails
    return null;
  }
};
