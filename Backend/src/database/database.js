import mongoose from 'mongoose'

function connect(){
    // Use .trim() to remove any accidental spaces from Render settings
    // Ensure the name here matches the KEY in your Render Environment tab
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

    if (!uri) {
        console.error("Database connection failed: No URI found in environment variables.");
        return;
    }

    mongoose.connect(uri.trim())
    .catch((err)=>{
        console.error("database connection failed:", err.message);
    })
}
export default connect;
