import { Page } from "puppeteer";
import axios from "axios";
import fs from "fs";

export async function extractInstagramImage(
  page: Page,
  outputPath: string
): Promise<void> {
  const ogImageUrl = await page.evaluate(() => {
    const ogImage = document.querySelector('meta[property="og:image"]');
    return ogImage?.getAttribute("content") || null;
  });

  if (!ogImageUrl) {
    throw new Error("og:image not found on Instagram page");
  }

  const response = await axios.get(ogImageUrl, { responseType: "arraybuffer" });

  fs.writeFileSync(outputPath, response.data);
}
