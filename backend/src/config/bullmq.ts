import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const screenshotQueue = new Queue("screenshot-queue", {
  connection,
});

const tagQueue = new Queue("tag-queue", {
  connection,
});

export { screenshotQueue, tagQueue, connection };
