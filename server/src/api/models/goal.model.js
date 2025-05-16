import { Schema, model } from "mongoose";

const goalSchema = new Schema({
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

goalSchema.pre(['save', 'findOneAndUpdate'], function(next) {
  if (this.getUpdate) {
    const update = this.getUpdate();
    if (update.progress !== undefined) {
      if (update.progress === 100) {
        update.status = "completed";
      } else if (update.progress > 0) {
        update.status = "in-progress";
      } else if (update.progress === 0) {
        update.status = "not-started";
      }
    }
  } else {
    if (this.progress === 100) {
      this.status = "completed";
    } else if (this.progress > 0) {
      this.status = "in-progress";
    } else if (this.progress === 0) {
      this.status = "not-started";
    }
  }
  next();
});

export const Goal = model("Goal", goalSchema);
