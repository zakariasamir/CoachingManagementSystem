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
import authRoutes from "./api/routes/auth.route";
import managerRoutes from "./api/routes/manager.route";
import coachRoutes from "./api/routes/coach.route";
import entrepreneurRoutes from "./api/routes/entrepreneur.route";
import userRoutes from "./api/routes/user.route";
import { errors } from "celebrate";
import { errorHandler } from "./api/middlewares/error.middleware";

config();

const app = express();

const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", process.env.FRONTEND_URL].filter(
    Boolean
  ) as string[],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

connectDB().catch((error: Error) => {
  console.error("Failed to connect to database:", error.message);
  process.exit(1);
});

app.use("/api/auth", authRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/users", userRoutes);
app.use("/api/entrepreneur", entrepreneurRoutes);

// Add celebrate error handler
app.use(errors());

// Add custom error handler
app.use(errorHandler);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5001;
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (error: Error) => {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  });

process.on("unhandledRejection", (error: Error) => {
  console.error("Unhandled Promise Rejection:", error);
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
});

export default app;
