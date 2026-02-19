import ContentItem from "../db/models/ContentItem";
import { extractPlatformFromUrl } from "../constants/platforms";
import { connectDB } from "../db";
import { config } from "../config";

/**
 * Migration script to backfill platform field for existing link-type content
 * This script analyzes all content items with type='link' and null platform,
 * extracts the platform from the URL, and updates the database.
 */
async function migratePlatforms() {
  try {
    console.log("🔄 Starting platform migration...");
    console.log(`📊 Connecting to database: ${config.MONGODB_URI}`);

    await connectDB();

    const itemsToMigrate = await ContentItem.find({
      type: "link",
      $or: [{ platform: null }, { platform: { $exists: false } }],
    }).select("_id url");

    const totalItems = itemsToMigrate.length;
    console.log(`📦 Found ${totalItems} items to migrate`);

    if (totalItems === 0) {
      console.log("✅ No items need migration. All done!");
      process.exit(0);
    }

    let updated = 0;
    let failed = 0;
    const batchSize = 100;

    for (let i = 0; i < totalItems; i += batchSize) {
      const batch = itemsToMigrate.slice(i, i + batchSize);
      const bulkOps = [];

      for (const item of batch) {
        try {
          if (!item.url) {
            console.warn(`⚠️  Item ${item._id} has no URL, skipping`);
            failed++;
            continue;
          }

          const platform = extractPlatformFromUrl(item.url);

          bulkOps.push({
            updateOne: {
              filter: { _id: item._id },
              update: { $set: { platform } },
            },
          });
        } catch (error) {
          console.error(`❌ Error processing item ${item._id}:`, error);
          failed++;
        }
      }

      if (bulkOps.length > 0) {
        const result = await ContentItem.bulkWrite(bulkOps);
        updated += result.modifiedCount;
        console.log(
          `📝 Batch ${Math.floor(i / batchSize) + 1}: Updated ${result.modifiedCount} items`,
        );
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Migration completed successfully!");
    console.log(`📊 Total items processed: ${totalItems}`);
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    console.log("=".repeat(50) + "\n");

    console.log("📊 Platform distribution:");
    const platformStats = await ContentItem.aggregate([
      {
        $match: {
          type: "link",
          platform: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 15,
      },
    ]);

    platformStats.forEach((stat) => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  }
}

migratePlatforms();
