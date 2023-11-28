import FnOParticipantPositionStats from "@/components/FnOParticipantPositionStats";
import { Divider } from "@tremor/react";

export default async function Stats() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full">
        <FnOParticipantPositionStats />
        <FnOParticipantPositionStats />
        <FnOParticipantPositionStats />
        <FnOParticipantPositionStats />
      </div>
    </main>
  );
}
