import { Document, Types } from "mongoose";
import { Request } from "express";

// Base interface for MongoDB documents
interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends BaseDocument {
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "manager" | "coach" | "entrepreneur";
  password: string;
}

export interface IOrganization extends BaseDocument {
  name: string;
}

export interface IOrganizationUser extends BaseDocument {
  organizationId: Types.ObjectId | IOrganization;
  userId: Types.ObjectId | IUser;
  role: "manager" | "coach" | "entrepreneur";
  status: "active" | "inactive";
  selected: boolean;
  joinedAt: Date;
}

export interface ISession extends BaseDocument {
  title: string;
  startTime: Date;
  endTime: Date;
  price: number;
  isAccepted: boolean;
  status: "requested" | "scheduled" | "completed" | "cancelled" | "declined";
  notes?: string;
}

export interface ISessionParticipant extends BaseDocument {
  sessionId: Types.ObjectId | ISession;
  userId: Types.ObjectId | IUser;
  role: "coach" | "entrepreneur";
  joinedAt: Date;
}

export interface ISessionOrganization extends BaseDocument {
  sessionId: Types.ObjectId | ISession;
  organizationId: Types.ObjectId | IOrganization;
}

export interface IGoal extends BaseDocument {
  entrepreneurId: Types.ObjectId | IUser;
  coachId: Types.ObjectId | IUser;
  organizationId: Types.ObjectId | IOrganization;
  sessionId: Types.ObjectId | ISession;
  title: string;
  description?: string;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  updates: Array<{
    updatedBy: Types.ObjectId | IUser;
    content: string;
    timestamp: Date;
  }>;
}

export interface IPayment extends BaseDocument {
  coachId: Types.ObjectId | IUser;
  organizationId: Types.ObjectId | IOrganization;
  sessionIds: Array<Types.ObjectId | ISession>;
  amount: number;
  status: "pending" | "paid";
  invoiceUrl?: string;
  issuedAt: Date;
  paidAt?: Date;
}

export interface IInvoice extends BaseDocument {
  paymentId: Types.ObjectId | IPayment;
  invoiceNumber: string;
  issuedTo: Types.ObjectId | IUser;
  organizationId: Types.ObjectId | IOrganization;
  status: "sent" | "viewed" | "paid";
  issuedAt: Date;
}

// Request and Response types
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
    role: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  exp: number;
}

// Type guards
export const isObjectId = (value: any): value is Types.ObjectId => {
  return value instanceof Types.ObjectId;
};

// Helper types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Helper types for pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
