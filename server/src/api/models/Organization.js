import { Schema, model } from 'mongoose';

const organizationSchema = new Schema({
  name: { type: String, required: true },
  settings: {
    sessionDuration: { type: Number, default: 60 }, // minutes
    invoiceTemplate: { type: String }, // optional custom invoice template
    allowExternalCoaches: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
});

export const Organization = model('Organization', organizationSchema);
