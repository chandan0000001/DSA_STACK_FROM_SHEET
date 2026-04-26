import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import problemModel from "./src/models/problems.model.js";

dotenv.config();

async function importData() {
  try {
    console.log("🔄 Starting import...");
    //  Connect DB
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing problems...");
    await problemModel.deleteMany({});
    console.log("✅ Collection cleared");

    //  Check existing data
    const existingCount = await problemModel.countDocuments();
    console.log(`📊 Existing problems: ${existingCount}`);

    //  Read JSON
    console.log("📖 Reading questions.json...");
    const rawData = JSON.parse(
      fs.readFileSync("./questions.json", "utf-8")
    );
    console.log(`✅ Found ${rawData.length} questions`);

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error("JSON file is empty or invalid");
    }

    //  Transform JSON → match schema (IMPORTANT: order added)
    const mappedData = rawData.map((q, index) => ({
      name: q.name || q.title || `Problem ${index}`,
      link: q.link || q.url,
      tags: Array.isArray(q.tags) ? q.tags : [],
      difficulty: ["Easy", "Medium", "Hard"].includes(q.difficulty)
        ? q.difficulty
        : "Easy",
      order: index + 1   //  REQUIRED FIX
    }));

    // Remove invalid entries
    const filteredData = mappedData.filter(q => q.name && q.link);
    console.log(`✅ After filtering: ${filteredData.length} valid problems`);

    //  Remove duplicates (by name)
    const uniqueMap = new Map();
    filteredData.forEach(q => {
      uniqueMap.set(q.name, q);
    });

    const uniqueData = Array.from(uniqueMap.values());
    console.log(`✅ After deduplication: ${uniqueData.length} unique problems`);

    //  Insert into DB with batch processing
    console.log("💾 Inserting into database (batch processing)...");
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < uniqueData.length; i += batchSize) {
      const batch = uniqueData.slice(i, i + batchSize);
      try {
        await problemModel.insertMany(batch);
        inserted += batch.length;
        const percentage = ((inserted / uniqueData.length) * 100).toFixed(2);
        console.log(`  ✅ Inserted ${inserted}/${uniqueData.length} (${percentage}%)`);
      } catch (batchErr) {
        console.warn(`  ⚠️  Batch insert error at ${i}-${i + batchSize}: ${batchErr.message}`);
      }
    }
    
    const finalCount = await problemModel.countDocuments();
    console.log(`\n🎉 IMPORT SUCCESSFUL! Total problems in DB: ${finalCount}`);
    process.exit(0);
  } catch (err) {
    console.error(" FULL ERROR:", err); //  important for debugging
    process.exit(1);
  }
}

importData();
