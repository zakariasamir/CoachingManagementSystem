import express, { json, urlencoded } from "express";
import { config } from "dotenv";
const app = express();
import cors from "cors";
import connectDB from "../src/config/db.js";
import authRoutes from "./api/routes/auth.route.js";
import managerRoutes from "./api/routes/manager.route.js";
import coachRoutes from "./api/routes/coach.route.js";
import entrepreneurRoutes from "./api/routes/entrepreneur.route.js";
import userRoutes from "./api/routes/user.route.js";
import cookieParser from "cookie-parser";

const corsOptions = {
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

config();
app.use(cors(corsOptions));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/users", userRoutes);
app.use("/api/entrepreneur", entrepreneurRoutes);

app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(process.env.PORT || 5001, () => {
  console.log(`Server is running on port ${process.env.PORT || 5001}`);
});
