import { Worker } from "bullmq";
import { connection } from "../config/bullmq";
import puppeteer from "puppeteer";
import { extractInstagramImage } from "src/utils/extractInstagramImage";
import cloudinary from "../config/cloudinary";
import ContentItem from "../db/models/ContentItem";
import { connectDB } from "../db";
import { Readable } from "stream";

(async () => {
  await connectDB();

  const worker = new Worker(
    "screenshot-queue",
    async (job) => {
      const { contentId, url, userId } = job.data;

      console.log(
        `Processing screenshot for contentId: ${contentId}, URL: ${url}`,
      );

      const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 1080 },
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        const contentItem = await ContentItem.findById(contentId);

        if (contentItem && contentItem.previewImageUrl) {
          console.log(
            `ContentId: ${contentId} already has a previewImageUrl. Skipping screenshot generation.`,
          );
          await browser.close();
          return;
        }

        let screenshotBuffer: Buffer;

        if (/instagram\.com\//.test(url)) {
          screenshotBuffer = await extractInstagramImage(page);
        } else {
          screenshotBuffer = (await page.screenshot({
            fullPage: true,
            type: "png",
          })) as Buffer;
        }

        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `archive/users/${userId}/screenshots`,
              public_id: contentId,
              resource_type: "image",
              format: "png",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );

          const bufferStream = Readable.from(screenshotBuffer);
          bufferStream.pipe(uploadStream);
        });

        const cloudinaryUrl = (uploadResult as any).secure_url;

        await ContentItem.findByIdAndUpdate(contentId, {
          previewImageUrl: cloudinaryUrl,
        });

        console.log(
          `Screenshot uploaded and saved for contentId: ${contentId}`,
        );
      } catch (err: any) {
        console.error(
          `Screenshot job failed for contentId: ${contentId}:`,
          err,
        );
      } finally {
        await browser.close();
      }
    },
    { connection },
  );

  console.log("Screenshot worker started.");
})();
