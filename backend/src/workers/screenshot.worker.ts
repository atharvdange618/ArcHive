import { Worker } from "bullmq";
import { connection } from "../config/bullmq";
import puppeteer from "puppeteer";
import ContentItem from "../db/models/ContentItem";

const worker = new Worker(
  "screenshot-queue",
  async (job) => {
    const { contentId, url } = job.data;
    const outputPath = "example-screenshot.png";

    console.log(`Processing job ${job.id} for URL: ${url}`);

    const browser = await puppeteer.launch({
      defaultViewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.screenshot({
      path: outputPath,
      fullPage: false,
    });

    await browser.close();

    // await ContentItem.findByIdAndUpdate(contentId, {
    //   $set: {
    //     previewImageUrl: screenshotBuffer.toString("base64") // TODO: convert this buffer into a url, through some service, will do this later,
    //   },
    // });

    console.log(`Job ${job.id} completed`);
  },
  { connection }
);

export default worker;
