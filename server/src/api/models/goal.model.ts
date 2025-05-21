import { Schema, model, Document, Query } from "mongoose";
import { IGoal } from "../types/index";

const goalSchema = new Schema<IGoal>({
  entrepreneurId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  coachId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  progress: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed"],
    default: "not-started",
  },
  updates: [
    {
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      content: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

goalSchema.pre(["save", "findOneAndUpdate"], function (next) {
  if ("getUpdate" in this) {
    const update = (this as Query<any, any>).getUpdate() as any;
    if (update?.progress !== undefined) {
      if (update.progress === 100) {
        update.status = "completed";
      } else if (update.progress > 0) {
        update.status = "in-progress";
      } else if (update.progress === 0) {
        update.status = "not-started";
      }
    }
  } else {
    const doc = this as Document & IGoal;
    if (doc.progress === 100) {
      doc.status = "completed";
    } else if (doc.progress > 0) {
      doc.status = "in-progress";
    } else if (doc.progress === 0) {
      doc.status = "not-started";
    }
  }
  next();
});

export const Goal = model<IGoal>("Goal", goalSchema);
