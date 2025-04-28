import { Schema, model } from 'mongoose';

const goalSchema = new Schema({
  entrepreneurId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  title: { type: String, required: true },
  description: { type: String },
  Progress: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed'], 
    default: 'not-started' 
  },
  updates: [
    {
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      content: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

export const Goal = model('Goal', goalSchema);
