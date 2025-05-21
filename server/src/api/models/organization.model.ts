import { Schema, model } from "mongoose";
import { IOrganization } from "../types/index";

const organizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Organization = model<IOrganization>(
  "Organization",
  organizationSchema
);
