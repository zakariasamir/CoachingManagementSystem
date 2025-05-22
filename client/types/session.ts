export interface SessionFormData {
  title: string;
  startTime: string;
  endTime: string;
  coachId: string;
  entrepreneurId: string;
  notes?: string;
  price: number;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Session {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
  participants: {
    _id: string;
    sessionId: string;
    userId: User;
    role: "coach" | "entrepreneur";
    joinedAt: string;
  }[];
}
