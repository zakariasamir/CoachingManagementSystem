import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionCardProps {
  session: {
    id: number;
    title: string;
    date: string;
    coach: string;
    entrepreneur: string;
    notes: string;
  };
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
          <strong>Date:</strong> {new Date(session.date).toLocaleString()}
        </p>
        <p>
          <strong>Notes:</strong> {session.notes}
        </p>
      </CardContent>
    </Card>
  );
};
