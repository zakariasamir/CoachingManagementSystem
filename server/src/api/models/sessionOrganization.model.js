import { Schema, model } from 'mongoose';

const sessionOrganizationSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
});

export const SessionOrganization = model('SessionOrganization', sessionOrganizationSchema);
