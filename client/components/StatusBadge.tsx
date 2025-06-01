import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  completed: {
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-400/50",
    label: "Completed"
  },
  scheduled: {
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-400/50",
    label: "Scheduled"
  },
  requested: {
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-400/50",
    label: "Requested"
  },
  declined: {
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-400/50",
    label: "Declined"
  },
  pending: {
    color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-400/50",
    label: "Pending"
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        config.color,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}