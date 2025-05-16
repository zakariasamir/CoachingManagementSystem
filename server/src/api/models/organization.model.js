import { Schema, model } from "mongoose";

const organizationSchema = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Organization = model("Organization", organizationSchema);
