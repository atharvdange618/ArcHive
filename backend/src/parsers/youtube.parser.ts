import { browserManager } from "../utils/browserManager";
import { AppError } from "../utils/errors";

/**
 * Parses a YouTube URL to extract video details using a headless browser.
 * It launches Puppeteer to render the page and scrapes the Open Graph (og) meta tags
 * to get the title, description, and thumbnail image.
 *
 * @param url The YouTube video URL.
 * @returns A promise that resolves to an object conforming to the link content type,
 * or throws an error if parsing fails.
 */
export const youtubeParser = async (url: string) => {
  const browser = await browserManager.getBrowser();
  const page = await browser.newPage();

  try {
    await page.setCookie({
      name: "CONSENT",
      value: `YES+cb.20240729-07-p0.en+FX+999`,
      domain: ".youtube.com",
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const metadata = await page.evaluate(() => {
      const title =
        document
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content") ||
        document.querySelector("title")?.textContent ||
        "";
      const description =
        document
          .querySelector('meta[property="og:description"]')
          ?.getAttribute("content") ||
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") ||
        "";
      const previewImageUrl =
        document
          .querySelector('meta[property="og:image"]')
          ?.getAttribute("content") || "";

      return { title, description, previewImageUrl };
    });

    if (!metadata.title) {
      throw new AppError(404, "Could not find title for the YouTube video.");
    }

    return {
      type: "link",
      title: metadata.title.trim(),
      description: metadata.description ? metadata.description.trim() : "",
      url: url,
      previewImageUrl: metadata.previewImageUrl || "",
    };
  } catch (error) {
    console.error(`Failed to parse YouTube URL ${url}:`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, `Failed to process YouTube URL: ${url}`);
  } finally {
    await page.close();
  }
};
