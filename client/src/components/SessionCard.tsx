import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: "scheduled" | "completed" | "cancelled";
    notes?: string;
    coach: string;
    entrepreneur: string;
  };
  onStatusChange: (
    newStatus: "scheduled" | "completed" | "cancelled"
  ) => Promise<void>;
}

export const SessionCard = ({ session }: SessionCardProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{session.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <strong>Coach:</strong> {session.coach}
        </p>
        <p>
          <strong>Entrepreneur:</strong> {session.entrepreneur}
        </p>
        <p>
          <strong>Start Time:</strong>{" "}
          {new Date(session.startTime).toLocaleString()}
        </p>
        <p>
          <strong>End Time:</strong>{" "}
          {new Date(session.endTime).toLocaleString()}
        </p>
        <p>
          <strong>Status:</strong> {session.status}
        </p>
        {session.notes && (
          <p>
            <strong>Notes:</strong> {session.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
