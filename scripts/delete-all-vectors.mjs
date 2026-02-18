import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";

const { PINECONE_API_KEY, PINECONE_INDEX_NAME } = process.env;

if (!PINECONE_API_KEY || !PINECONE_INDEX_NAME) {
  console.error("❌ Missing required environment variables:");
  console.error("   PINECONE_API_KEY, PINECONE_INDEX_NAME");
  process.exit(1);
}

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX_NAME);

async function deleteAllVectors() {
  console.log("🗑️  Deleting ALL vectors from Pinecone index...\n");

  try {
    // Get stats before deletion
    const statsBefore = await index.describeIndexStats();
    const beforeCount = statsBefore.totalRecordCount || statsBefore.totalVectorCount || 0;
    console.log(`📊 Current total vectors: ${beforeCount}`);

    if (beforeCount === 0) {
      console.log("✅ Index is already empty!");
      return;
    }

    // Delete all vectors using deleteAll
    console.log("\n🗑️  Deleting all vectors...");
    await index.deleteAll();

    // Wait for deletion to propagate
    console.log("⏳ Waiting for deletion to propagate...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify deletion
    const statsAfter = await index.describeIndexStats();
    const afterCount = statsAfter.totalRecordCount || statsAfter.totalVectorCount || 0;

    console.log(`\n✅ Deletion complete!`);
    console.log(`   Before: ${beforeCount} vectors`);
    console.log(`   After: ${afterCount} vectors`);
    console.log(`   Deleted: ${beforeCount - afterCount} vectors`);

  } catch (error) {
    console.error("\n❌ Error deleting vectors:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

deleteAllVectors()
  .then(() => {
    console.log("\n✨ Done! Index is now empty and ready for new data.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
