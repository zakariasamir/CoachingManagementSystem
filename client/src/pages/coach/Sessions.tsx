import { SessionCard } from "@/components/SessionCard";
import { sessions } from "@/data/fakeData";

export default function CoachSessions() {
  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Coach Sessions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    </div>
  );
}
