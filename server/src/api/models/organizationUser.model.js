import { Schema, model } from "mongoose";

const organizationUserSchema = new Schema({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: {
    type: String,
    enum: ["manager", "coach", "entrepreneur"],
    required: true,
  },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  isSelected: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
});

export const OrganizationUser = model(
  "OrganizationUser",
  organizationUserSchema
);
