export interface SessionFormData {
  title: string;
  startTime: string;
  endTime: string;
  coachId: string;
  entrepreneurIds: string[];
  notes: string;
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
  status: string;
  notes: string;
  price: number;
  participants: {
    _id: string;
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    role: "coach" | "entrepreneur";
    status: string;
  }[];
}

export interface SessionCardProps {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled" | "requested" | "declined";
  price: number;
  notes: string;
  coach: {
    firstName: string;
    lastName: string;
  };
  entrepreneursCount: number;
}
