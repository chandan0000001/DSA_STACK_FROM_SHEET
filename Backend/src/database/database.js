import mongoose from 'mongoose'

async function connect() {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

    if (!uri) {
        throw new Error("Database connection failed: No URI found in environment variables.");
    }

    await mongoose.connect(uri.trim());
    console.log("✅ Database connected");
}

export default connect;
