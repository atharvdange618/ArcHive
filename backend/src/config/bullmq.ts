import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const queue = new Queue("screenshot-queue", {
  connection,
});

export { queue, connection };
