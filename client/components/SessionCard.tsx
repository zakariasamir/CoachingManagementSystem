import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  onStatusChange?: (
    newStatus: "scheduled" | "completed" | "cancelled"
  ) => Promise<void>;
}

export const SessionCard = ({ session, onStatusChange }: SessionCardProps) => {
  const { user } = useAuth();
  const isCoach = user?.role === "coach";

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === session.status) return;
    if (onStatusChange) {
      await onStatusChange(newStatus as "scheduled" | "completed" | "cancelled");
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{session.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
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
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-1 text-center justify-center text-xs rounded-full ${
              session.status === "completed"
                ? "bg-green-100 text-green-600"
                : session.status === "cancelled"
                ? "bg-red-100 text-red-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {session.status}
          </span>
        </p>
        {session.notes && (
          <p>
            <strong>Notes:</strong> {session.notes}
          </p>
        )}
      </CardContent>
      {isCoach && (
        <CardFooter className="pt-4">
          <Select
            value={session.status}
            onValueChange={handleStatusChange}
            disabled={session.status === "cancelled"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardFooter>
      )}
    </Card>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case "scheduled":
      return "text-blue-600 dark:text-blue-400";
    case "completed":
      return "text-green-600 dark:text-green-400";
    case "cancelled":
      return "text-red-600 dark:text-red-400";
    default:
      return "";
  }
}
