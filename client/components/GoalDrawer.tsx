import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Goal {
  _id: string;
  title: string;
  description: string;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  entrepreneurId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  organizationId: string;
  coachId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updates: Array<{
    updatedBy?: string;
    content?: string;
    timestamp?: string;
  }>;
  createdAt: string;
  __v: number;
}

interface GoalDrawerProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalDrawer({ goal, isOpen, onClose }: GoalDrawerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in-progress":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="w-full">
        <div className=" w-full overflow-scroll rounded-lg bg-white shadow-lg">
          <DrawerHeader className="text-left">
            <DrawerTitle>{goal.title}</DrawerTitle>
            <DrawerDescription>
              Created on {new Date(goal.createdAt).toLocaleDateString()}
            </DrawerDescription>
          </DrawerHeader>
          <div className="h-full w-full px-4 overflow-y-auto" style={{ width: "100%" }}>
            <div className="space-y-6 pb-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Entrepreneur</h3>
                <p className="text-sm text-muted-foreground">
                  {goal.entrepreneurId.firstName} {goal.entrepreneurId.lastName}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm">{goal.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <p
                  className={`text-sm font-medium ${getStatusColor(
                    goal.status
                  )}`}
                >
                  {goal.status.replace("-", " ").toUpperCase()}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Progress</h3>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-muted-foreground">
                    {goal.progress}% Complete
                  </p>
                </div>
              </div>

              {goal.updates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Updates History</h3>
                  <div className="space-y-3">
                    {goal.updates.map((update, index) => (
                      <div
                        key={index}
                        className="text-sm space-y-1 p-3 bg-muted rounded-md"
                      >
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            update.timestamp || ""
                          ).toLocaleDateString()}
                        </p>
                        <p>{update.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
