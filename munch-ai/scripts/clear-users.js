const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/munchAI";

console.log("Connecting to:", MONGODB_URI.substring(0, 50) + "...");

// Define UserSchema
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date },
    name: String,
    image: String,
    password: String,
    dietaryRestrictions: [String],
    allergies: [String],
    cuisinePreferences: [String],
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

async function clearUsers() {
  try {
    await connectDB();

    console.log("🗑️  Clearing all users from the database...");
    const deleteResult = await User.deleteMany({});

    console.log(`✅ Successfully deleted ${deleteResult.deletedCount} users`);
    console.log(`\n✨ Database has been cleared of all users!\n`);
  } catch (error) {
    console.error("❌ Error clearing users:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
  }
}

clearUsers();
