import { Schema, model } from 'mongoose';

const sessionSchema = new Schema({
  coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  entrepreneurId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Session = model('Session', sessionSchema);
