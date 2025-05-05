import { Schema, model } from 'mongoose';

const paymentSchema = new Schema({
  coachId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  sessionIds: [{ type: Schema.Types.ObjectId, ref: 'Session' }],
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid'], 
    default: 'pending' 
  },
  invoiceUrl: { type: String }, // Link to generated invoice (could be in S3 or another storage)
  issuedAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
});

export const Payment = model('Payment', paymentSchema);
