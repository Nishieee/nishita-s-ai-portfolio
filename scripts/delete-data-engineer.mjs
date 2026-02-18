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

async function deleteDataEngineerVectors() {
  console.log("🔍 Searching for Data Engineer vectors in Pinecone...\n");

  try {
    // Query with a dummy vector to get all vectors, then filter by metadata
    // Or we can use the deleteMany with filter
    // Since Pinecone supports metadata filtering, let's use that
    
    // First, let's get stats to see current count
    const statsBefore = await index.describeIndexStats();
    console.log(`📊 Current total vectors: ${statsBefore.totalRecordCount || statsBefore.totalVectorCount || 'unknown'}`);

    // Delete all vectors where role = "Data Engineer"
    // Pinecone deleteMany supports metadata filters
    console.log("\n🗑️  Deleting all vectors with role='Data Engineer'...");
    
    const deleteResponse = await index.deleteMany({
      filter: {
        role: { $eq: "Data Engineer" }
      }
    });

    console.log("✅ Delete operation completed!");
    console.log(`   Response:`, deleteResponse);

    // Wait a moment for deletion to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check stats after deletion
    const statsAfter = await index.describeIndexStats();
    console.log(`\n📊 Total vectors after deletion: ${statsAfter.totalRecordCount || statsAfter.totalVectorCount || 'unknown'}`);
    
    const deletedCount = (statsBefore.totalRecordCount || statsBefore.totalVectorCount || 0) - 
                         (statsAfter.totalRecordCount || statsAfter.totalVectorCount || 0);
    
    console.log(`\n✅ Successfully deleted approximately ${deletedCount} Data Engineer vectors!`);
    console.log("\n💡 Remaining roles in Pinecone:");
    console.log("   - Business Intelligence Engineer");
    console.log("   - Data Analyst");
    console.log("   - Data Scientist");

  } catch (error) {
    console.error("\n❌ Error deleting vectors:", error.message);
    
    // Fallback: Try to delete by ID pattern if metadata filter doesn't work
    if (error.message.includes("filter") || error.message.includes("deleteMany")) {
      console.log("\n⚠️  Trying alternative method: deleting by ID pattern...");
      
      // Generate all possible IDs for Data Engineer resume
      const idsToDelete = [];
      
      // Summary chunks (usually 1-2)
      for (let i = 0; i < 5; i++) {
        idsToDelete.push(`data-engineer-summary-${i}`);
      }
      
      // Skills chunks (usually 1-2)
      for (let i = 0; i < 5; i++) {
        idsToDelete.push(`data-engineer-skills-${i}`);
      }
      
      // Experience chunks
      const companies = ["humanitarians-ai", "epm-consultancy", "davinci-corps"];
      const projects = ["ecommerce-platform", "oil-gas-supply-chain-client"];
      
      for (const company of companies) {
        for (let i = 0; i < 10; i++) {
          idsToDelete.push(`data-engineer-exp-${company}-${i}`);
        }
      }
      
      for (const company of ["epm-consultancy"]) {
        for (const project of projects) {
          for (let i = 0; i < 10; i++) {
            idsToDelete.push(`data-engineer-exp-${company}-${project}-${i}`);
          }
        }
      }
      
      // Education chunks
      for (let i = 0; i < 5; i++) {
        idsToDelete.push(`data-engineer-education-${i}`);
      }
      
      // Project chunks
      const projectNames = ["adnomaly", "aivy"];
      for (const proj of projectNames) {
        for (let i = 0; i < 5; i++) {
          idsToDelete.push(`data-engineer-project-${proj}-${i}`);
        }
      }
      
      console.log(`   Attempting to delete ${idsToDelete.length} potential IDs...`);
      
      // Delete in batches of 1000 (Pinecone limit)
      const batchSize = 1000;
      let deleted = 0;
      
      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);
        try {
          await index.deleteMany(batch);
          deleted += batch.length;
          console.log(`   ✅ Deleted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} IDs`);
        } catch (err) {
          console.log(`   ⚠️  Batch ${Math.floor(i / batchSize) + 1} had some errors (some IDs may not exist)`);
        }
      }
      
      console.log(`\n✅ Deleted ${deleted} IDs (some may not have existed)`);
    }
    
    process.exit(1);
  }
}

deleteDataEngineerVectors()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
