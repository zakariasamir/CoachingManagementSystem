// src/pages/manager/Sessions.tsx
import { useState } from "react";
import { SessionCard } from "@/components/SessionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SessionForm from "@/components/forms/SessionForm";

const sessionsData = [
  {
    id: 1,
    title: "Session 1",
    date: "2025-04-29T10:00",
    coach: "Coach 1",
    entrepreneur: "Entrepreneur 1",
    notes: "Initial meeting.",
  },
  {
    id: 2,
    title: "Session 2",
    date: "2025-04-30T14:00",
    coach: "Coach 2",
    entrepreneur: "Entrepreneur 2",
    notes: "Review progress.",
  },
  // Add more session objects as needed.
];

const Sessions = () => {
  const [isSessionFormOpen, setSessionFormOpen] = useState(false);
  const [sessions, setSessions] = useState(sessionsData);

  const handleAddSession = (newSessionData: any) => {
    const newSession = { ...newSessionData, id: sessions.length + 1 };
    setSessions((prev) => [...prev, newSession]);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Manage Sessions</h2>
      <Button className="my-4" onClick={() => setSessionFormOpen(true)}>
        New Session +
      </Button>
      <SessionForm
        isOpen={isSessionFormOpen}
        onClose={() => setSessionFormOpen(false)}
        onSubmit={handleAddSession}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default Sessions;
