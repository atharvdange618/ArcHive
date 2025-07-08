import { Worker } from "bullmq";
import { connection } from "../config/bullmq";
import puppeteer from "puppeteer";
import { extractInstagramImage } from "src/utils/extractInstagramImage";

const worker = new Worker(
  "screenshot-queue",
  async (job) => {
    const { contentId, url } = job.data;
    const outputPath = "example-screenshot.png";

    console.log(`Processing job ${contentId} for URL: ${url}`);

    const browser = await puppeteer.launch({
      defaultViewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: "networkidle2" });

      if (/instagram\.com\//.test(url)) {
        await extractInstagramImage(page, outputPath);
      } else {
        await page.screenshot({
          path: outputPath,
          fullPage: false,
        });
      }

      console.log(`Job ${contentId} completed`);
    } catch (err) {
      console.error(`Job ${contentId} failed:`, err);
    } finally {
      await browser.close();
    }
  },
  { connection }
);

export default worker;
