import { Schema, model } from "mongoose";

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["admin", "manager", "coach", "entrepreneur"],
    required: true,
    default: "employee",
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const User = model("User", userSchema);
