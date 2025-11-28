import { Page } from "puppeteer";
import { NotFoundError } from "../utils/errors";
import axios from "axios";

export async function extractInstagramImage(page: Page): Promise<Buffer> {
  const ogImageUrl = await page.evaluate(() => {
    const ogImage = document.querySelector('meta[property="og:image"]');
    return ogImage?.getAttribute("content") || null;
  });

  if (!ogImageUrl) {
    throw new NotFoundError("og:image not found on Instagram page");
  }

  const response = await axios.get(ogImageUrl, { responseType: "arraybuffer" });

  return Buffer.from(response.data);
}
