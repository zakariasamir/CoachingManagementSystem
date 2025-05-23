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
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useOrganization } from "@/hooks/useOrganization";
interface SessionCardProps {
  session: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
    price: number;
    coach: {
      firstName: string;
      lastName: string;
    };
    entrepreneursCount: number;
  };
  onStatusChange?: (newStatus: string) => Promise<void>;
}

export function SessionCard({ session, onStatusChange }: SessionCardProps) {
  const { selectedOrganization } = useOrganization();
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "";
    }
  };

  // Determine the link path based on whether onStatusChange is provided
  const linkPath = `/${selectedOrganization?.role}/sessions/${session.id}`;

  return (
    <Link href={linkPath}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold truncate">{session.title}</h3>
            {onStatusChange ? (
              <select
                className="text-sm border rounded px-2 py-1"
                value={session.status}
                onChange={(e) => {
                  e.preventDefault(); // Prevent link navigation
                  onStatusChange(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()} // Prevent link navigation
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            ) : (
              <Badge
                variant={session.status === "pending" ? "outline" : "default"}
                className={getStatusColor(session.status)}
              >
                {session.status.charAt(0).toUpperCase() +
                  session.status.slice(1)}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Coach: {session.coach.firstName} {session.coach.lastName}
          </p>

          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(session.startTime), "MMMM d, yyyy")}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(session.startTime), "h:mm a")} -{" "}
                {format(new Date(session.endTime), "h:mm a")}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>{session.price} MAD</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {session.entrepreneursCount} Entrepreneur
              {session.entrepreneursCount !== 1 && "s"}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

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
