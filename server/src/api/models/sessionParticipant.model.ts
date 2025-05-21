import { Schema, model } from "mongoose";
import { ISessionParticipant } from "../types/index";

const sessionParticipantSchema = new Schema<ISessionParticipant>({
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["coach", "entrepreneur"], required: true },
  joinedAt: { type: Date, default: Date.now },
});

export const SessionParticipant = model<ISessionParticipant>(
  "SessionParticipant",
  sessionParticipantSchema
);
