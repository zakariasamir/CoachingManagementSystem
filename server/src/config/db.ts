import mongoose from "mongoose";
import { config } from "dotenv";

config();

const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGODB_ATLAS_URI) {
      throw new Error(
        "MONGODB_ATLAS_URI is not defined in environment variables"
      );
    }

    await mongoose.connect(process.env.MONGODB_ATLAS_URI);
    console.log("MongoDB connected to CoachingManagmentSysteme database");
  } catch (err) {
    console.error(
      "MongoDB connection error:",
      err instanceof Error ? err.message : "Unknown error"
    );
    process.exit(1);
  }
};

export default connectDB;
