import FnOParticipantPositionStats from "@/components/fno/FnOParticipantPositionStats";
import { Divider } from "@tremor/react";

export default async function Stats() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full p-4">
        <FnOParticipantPositionStats />
        <FnOParticipantPositionStats />
        <FnOParticipantPositionStats />
        <FnOParticipantPositionStats />
      </div>
    </main>
  );
}
