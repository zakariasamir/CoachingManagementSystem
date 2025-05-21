import { Schema, model } from "mongoose";
import { IUser } from "../types/index";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["admin", "manager", "coach", "entrepreneur"],
      required: true,
    },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // This will automatically add createdAt and updatedAt
  }
);

export const User = model<IUser>("User", userSchema);
