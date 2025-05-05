const sessionSchema = new Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});
export const Session = model('Session', sessionSchema);
