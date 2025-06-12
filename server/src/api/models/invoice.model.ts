import { Schema, model, Types } from "mongoose";
import { IInvoice } from "../types/index";

const invoiceSchema = new Schema<IInvoice>(
  {
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issuedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "viewed", "paid"],
      default: "sent",
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice = model<IInvoice>("Invoice", invoiceSchema);
