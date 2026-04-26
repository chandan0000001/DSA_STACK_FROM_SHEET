import "dotenv/config";
import mongoose from "mongoose";
import SystemState from "../src/models/systemState.model.js";
import userDailyProgressModel from "../src/models/userDailyProgress.model.js";

function getDateKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMongoUri() {
  const raw = process.env.MONGODB_URI || process.env.MONGODB_URL || "";
  return raw.replace(/^MONGODB_URL=/, "").trim();
}

async function main() {
  const arg = process.argv[2];
  const nextIndex = Number(arg);

  if (!Number.isInteger(nextIndex) || nextIndex < 0) {
    console.error("Usage: node scripts/setDailyPointer.js <non-negative-index>");
    process.exit(1);
  }

  const uri = getMongoUri();
  if (!uri) {
    console.error("MongoDB URI is missing.");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const today = getDateKey();
  const existingTodayAssignments = await userDailyProgressModel.countDocuments({ date: today });

  const state = await SystemState.findOneAndUpdate(
    { key: "daily_pointer" },
    { $set: { lastIndex: nextIndex } },
    { upsert: true, new: true }
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Failed to update daily pointer:", error.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
