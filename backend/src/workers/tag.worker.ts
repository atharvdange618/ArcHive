import { Worker } from "bullmq";
import { connection } from "../config/bullmq";
import { connectDB } from "../db";
import { generateTagsFromUrl } from "src/utils/generateTagsFromUrl";
import ContentItem from "src/db/models/ContentItem";

(async () => {
  await connectDB();

  const worker = new Worker(
    "tag-queue",
    async (job) => {
      const { contentId, url } = job.data;
      console.log(
        `Processing tag generation for contentId: ${contentId}, URL: ${url}`,
      );

      try {
        const tags = await generateTagsFromUrl(url);
        await ContentItem.findByIdAndUpdate(contentId, { tags });
        console.log(`Tags generated and updated for contentId: ${contentId}`);
      } catch (error) {
        console.error(
          `Failed to generate or update tags for contentId: ${contentId}`,
          error,
        );
      }
    },
    { connection },
  );

  console.log("Tag worker started.");
})();
