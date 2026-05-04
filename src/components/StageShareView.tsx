"use client";

import { BroadcastStage } from "@/components/BroadcastStage";
import { useSyncedMeetingState } from "@/hooks/useSyncedMeetingState";

export function StageShareView() {
  const [meetingState] = useSyncedMeetingState();

  return (
    <main className="relative grid h-screen place-items-center overflow-hidden bg-slate-950 p-2">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(71,184,255,0.18),transparent_31%),radial-gradient(circle_at_82%_22%,rgba(255,107,154,0.15),transparent_30%),linear-gradient(135deg,#070914_0%,#0d1120_45%,#160f1f_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10">
        <BroadcastStage
          topic={meetingState.topic}
          leftLabel={meetingState.leftLabel}
          rightLabel={meetingState.rightLabel}
          speakers={meetingState.speakers}
          activeSpeakerId={meetingState.activeSpeakerId}
          audienceVotes={meetingState.audienceVotes}
          mode="share"
          onActiveSpeakerChange={() => undefined}
        />
      </div>
    </main>
  );
}
