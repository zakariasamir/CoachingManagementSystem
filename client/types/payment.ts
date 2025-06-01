import { Session } from "./session";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Payment {
  _id: string;
  coachId: User;
  organizationId: string;
  sessionIds: Session[];
  amount: number;
  status: "pending" | "paid";
  invoiceUrl?: string;
  issuedAt: string;
  paidAt?: string;
}

// export interface Invoice {
//   _id: string;
//   paymentId: Payment;
//   invoiceNumber: string;
//   issuedTo: string;
//   organizationId: string;
//   amount: number;
//   currency: string;
//   status: "sent" | "viewed" | "paid";
//   issuedAt: string;
// }

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  paymentId: {
    coachId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    sessionIds: Array<{
      _id: string;
      title: string;
    }>;
    paidAt?: string;
  };
  amount: number;
  currency: string;
  status: "draft" | "sent" | "viewed" | "paid";
  issuedAt: string;
  dueDate: string;
}

export type InvoiceStatus = Invoice['status'] | 'all';