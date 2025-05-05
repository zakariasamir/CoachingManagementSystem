import { Schema, model } from 'mongoose';

const sessionParticipantSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['coach', 'entrepreneur'], required: true },
  joinedAt: { type: Date, default: Date.now }
});

export const SessionParticipant = model('SessionParticipant', sessionParticipantSchema);
