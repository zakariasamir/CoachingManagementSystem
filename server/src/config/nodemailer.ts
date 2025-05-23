/**
 * Email Service Configuration
 *
 * Sets up Nodemailer for sending emails using Gmail SMTP.
 * Requires EMAIL_USER and EMAIL_PASS environment variables to be set.
 */

import nodemailer, { Transporter } from "nodemailer";
import { config } from "dotenv";

// Load environment variables
config();

// Validate required environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error(
    "Email configuration is missing. Please set EMAIL_USER and EMAIL_PASS in environment variables."
  );
}

/**
 * Gmail SMTP Configuration
 * Uses SSL for secure email transmission
 */
const transporter: Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify email configuration on startup
transporter.verify((error: Error | null, success: boolean) => {
  if (error) {
    console.error("Email service configuration error:", error);
    // Don't exit process as email might not be critical for the application
  } else {
    console.log("Email service configured successfully");
  }
});

export default transporter;
