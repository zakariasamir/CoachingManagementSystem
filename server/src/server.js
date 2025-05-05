import express, { json, urlencoded } from "express";
import { config } from "dotenv";
const app = express();
import cors from "cors";
import connectDB from "../src/config/db.js";
import authRoutes from "./api/routes/auth.route.js";
import organizatioRoutes from "./api/routes/organization.route.js";
import cookieParser from "cookie-parser";

config();
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/organization", organizatioRoutes);
app.use("/api/user", userRoutes);
app.use("/api/session", sessionRoutes);

app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
