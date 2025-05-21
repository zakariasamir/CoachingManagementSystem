import { Schema, model } from "mongoose";
import { ISession } from "../types/index";

const sessionSchema = new Schema<ISession>({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  price: { type: Number, required: true },
  isAccepted: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["requested", "declined", "scheduled", "completed", "cancelled"],
    default: "requested",
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Session = model<ISession>("Session", sessionSchema);
