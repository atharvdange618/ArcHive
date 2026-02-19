import { browserManager } from "../utils/browserManager";
import { AppError } from "../utils/errors";
import { PLATFORMS } from "../constants/platforms";

/**
 * Parses an X/Twitter URL to extract content details using a headless browser.
 * It launches Puppeteer to render the page and scrapes Open Graph (og) and Twitter-specific meta tags
 * to get the title, description, and preview image.
 *
 * @param url The X/Twitter URL.
 * @returns A promise that resolves to an object conforming to the link content type,
 * or throws an error if parsing fails.
 */
export const xParser = async (url: string) => {
  const browser = await browserManager.getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const metadata = await page.evaluate(() => {
      const getMetaContent = (property: string) =>
        document
          .querySelector(`meta[property="${property}"]`)
          ?.getAttribute("content") || "";
      const getTwitterMetaContent = (name: string) =>
        document
          .querySelector(`meta[name="twitter:${name}"]`)
          ?.getAttribute("content") || "";

      const title =
        getMetaContent("og:title") ||
        getTwitterMetaContent("title") ||
        document.querySelector("title")?.textContent ||
        "";
      const description =
        getMetaContent("og:description") ||
        getTwitterMetaContent("description") ||
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") ||
        "";
      const previewImageUrl =
        getMetaContent("og:image") || getTwitterMetaContent("image") || "";

      return { title, description, previewImageUrl };
    });

    if (!metadata.title) {
      throw new AppError(
        404,
        "Could not find title for the X/Twitter content.",
      );
    }

    return {
      type: "link",
      title: metadata.title.trim(),
      description: metadata.description ? metadata.description.trim() : "",
      url: url,
      previewImageUrl: metadata.previewImageUrl || "",
      platform: PLATFORMS.TWITTER,
    };
  } catch (error) {
    console.error(`Failed to parse X/Twitter URL ${url}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, `Failed to process X/Twitter URL: ${url}`);
  } finally {
    await page.close();
  }
};
