import { Schema, model } from "mongoose";
import { IInvoice } from "../types/index";

const invoiceSchema = new Schema<IInvoice>({
  paymentId: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  issuedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  status: {
    type: String,
    enum: ["sent", "viewed", "paid"],
    default: "sent",
  },
  issuedAt: { type: Date, default: Date.now },
});

export const Invoice = model<IInvoice>("Invoice", invoiceSchema);
