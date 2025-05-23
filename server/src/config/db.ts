/**
 * Database Configuration
 *
 * Establishes connection to MongoDB using Mongoose.
 * Requires MONGODB_ATLAS_URI environment variable to be set.
 */

import mongoose from "mongoose";
import { config } from "dotenv";

// Load environment variables
config();

/**
 * Connects to MongoDB using the provided connection string.
 * Exits the process if connection fails or if the connection string is not provided.
 */
const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_ATLAS_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGODB_ATLAS_URI is not defined in environment variables"
      );
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully");

    // Log when the connection is lost
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB connection lost");
    });

    // Log when the connection is reconnected
    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected successfully");
    });
  } catch (err) {
    console.error(
      "MongoDB connection error:",
      err instanceof Error ? err.message : "Unknown error"
    );
    process.exit(1);
  }
};

export default connectDB;
