import { Schema, model } from "mongoose";
import { IOrganizationUser } from "../types/index";

const organizationUserSchema = new Schema<IOrganizationUser>({
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
  selected: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
});

export const OrganizationUser = model<IOrganizationUser>(
  "OrganizationUser",
  organizationUserSchema
);
