/**
 * Main Server Configuration
 *
 * This file sets up the Express server with all necessary middleware,
 * route handlers, and error handling. It also establishes the database
 * connection and configures process-level error handlers.
 */

import express, {
  json,
  urlencoded,
  Request,
  Response,
  NextFunction,
} from "express";
import { config } from "dotenv";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import { errors } from "celebrate";
import { errorHandler } from "./api/middlewares/error.middleware";

// Route imports
import authRoutes from "./api/routes/auth.route";
import managerRoutes from "./api/routes/manager.route";
import coachRoutes from "./api/routes/coach.route";
import entrepreneurRoutes from "./api/routes/entrepreneur.route";
import userRoutes from "./api/routes/user.route";

// Load environment variables
config();

const app = express();

// CORS configuration
const corsOptions: CorsOptions = {
  origin: ["http://localhost:3001", process.env.FRONTEND_URL].filter(
    Boolean
  ) as string[],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
connectDB().catch((error: Error) => {
  console.error("Failed to connect to database:", error.message);
  process.exit(1);
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/users", userRoutes);
app.use("/api/entrepreneur", entrepreneurRoutes);

// Error handling middleware
app.use(errors()); // Celebrate validation errors
app.use(errorHandler); // Custom error handler

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Server initialization
const PORT = process.env.PORT || 5001;
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (error: Error) => {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  });

// Process-level error handling
process.on("unhandledRejection", (error: Error) => {
  console.error("Unhandled Promise Rejection:", error);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
});

export default app;
