import nodemailer, { Transporter } from "nodemailer";
import { config } from "dotenv";

config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error("Email configuration is missing in environment variables");
}

const transporter: Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error: Error | null, success: boolean) => {
  if (error) {
    console.error("Nodemailer configuration error:", error);
  } else {
    console.log("Nodemailer is ready to send emails");
  }
});

export default transporter;
