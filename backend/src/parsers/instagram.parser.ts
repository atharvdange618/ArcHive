import axios from "axios";
import * as cheerio from "cheerio";
import { PLATFORMS } from "../constants/platforms";

export const instagramParser = async (url: string) => {
  try {
    const shortcode = url.match(/\/(p|reel)\/([^/?]+)/)?.[2];
    if (!shortcode) throw new Error("Invalid Instagram URL");

    const { data: html } = await axios.get(
      `https://www.instagram.com/p/${shortcode}/embed/`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
        },
      },
    );

    const $ = cheerio.load(html);

    const title = $(".UsernameText").first().text().trim();
    const previewImageUrl = $(".EmbeddedMediaImage").attr("src") || "";

    if (!title && !previewImageUrl) {
      console.warn(
        `[instagramParser] Both fields empty — selectors may have changed`,
      );
    }

    return {
      type: "link",
      title,
      description: "",
      content: "",
      url,
      previewImageUrl,
      tags: [],
      platform: PLATFORMS.INSTAGRAM,
    };
  } catch (error) {
    console.error(`[instagramParser] Failed to parse ${url}:`, error);
    return {
      type: "link",
      title: "",
      description: "",
      content: "",
      url,
      previewImageUrl: "",
      tags: [],
      platform: PLATFORMS.INSTAGRAM,
    };
  }
};
