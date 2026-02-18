import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";

const { PINECONE_API_KEY, PINECONE_INDEX_NAME, PINECONE_INDEX_DIMENSION } = process.env;

if (!PINECONE_API_KEY) {
  console.error("❌ PINECONE_API_KEY is required");
  process.exit(1);
}

if (!PINECONE_INDEX_NAME) {
  console.error("❌ PINECONE_INDEX_NAME is required");
  process.exit(1);
}

// 1536 for OpenAI (text-embedding-3-small); 768 for Open Text / HF / Xenova
const dimensions = parseInt(PINECONE_INDEX_DIMENSION || "768", 10) || 768;

try {
  console.log(`✅ Using embedding dimensions: ${dimensions}${dimensions === 1536 ? " (OpenAI text-embedding-3-small)" : " (Open Text / HF / Xenova)"}`);
  
  // Initialize Pinecone
  const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
  
  // Check if index already exists
  const existingIndexes = await pinecone.listIndexes();
  const indexExists = existingIndexes.indexes?.some(idx => idx.name === PINECONE_INDEX_NAME);
  
  if (indexExists) {
    console.log(`\n⚠️  Index "${PINECONE_INDEX_NAME}" already exists.`);
    console.log("   If you want to recreate it, delete it first in the Pinecone console.");
    console.log("   Or use a different PINECONE_INDEX_NAME in your .env file.");
    process.exit(0);
  }
  
  console.log(`\n📦 Creating Pinecone index: "${PINECONE_INDEX_NAME}"`);
  console.log(`   Dimensions: ${dimensions}`);
  console.log(`   Metric: cosine`);
  
  await pinecone.createIndex({
    name: PINECONE_INDEX_NAME,
    dimension: dimensions,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });
  
  console.log(`\n✅ Index "${PINECONE_INDEX_NAME}" created successfully!`);
  console.log("\n📝 Next steps:");
  console.log("   1. Wait a few minutes for the index to be ready");
  console.log("   2. Run the resume ingestion script to populate it");
  console.log("   3. Test your chat interface");
  
} catch (error) {
  console.error("\n❌ Error:", error.message);
  if (error.message.includes("already exists")) {
    console.log("\n💡 The index already exists. You can:");
    console.log("   - Use it as-is (if dimensions match)");
    console.log("   - Delete it in Pinecone console and run this script again");
    console.log("   - Use a different PINECONE_INDEX_NAME");
  }
  process.exit(1);
}
