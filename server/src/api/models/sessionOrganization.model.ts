import { Schema, model } from "mongoose";
import { ISessionOrganization } from "../types/index";

const sessionOrganizationSchema = new Schema<ISessionOrganization>({
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
});

export const SessionOrganization = model<ISessionOrganization>(
  "SessionOrganization",
  sessionOrganizationSchema
);
