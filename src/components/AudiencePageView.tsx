"use client";

import Link from "next/link";

import { useSyncedMeetingState } from "@/hooks/useSyncedMeetingState";
import type { AudienceVote, MeetingState } from "@/types/meeting";

import { AudienceVotePanel } from "./AudienceVotePanel";
import { BroadcastStage } from "./BroadcastStage";

const localAudienceId = "local-audience";
const localAudienceName = "自分";

export function AudiencePageView() {
  const [meetingState, setMeetingState] = useSyncedMeetingState();
  const selectedAudienceValue =
    meetingState.audienceVotes.find((vote) => vote.id === localAudienceId)?.value ??
    null;

  function updateMeetingState(updater: (currentState: MeetingState) => MeetingState) {
    setMeetingState(updater);
  }

  function handleAudienceVote(value: number) {
    updateMeetingState((currentState) => {
      const nextVote: AudienceVote = {
        id: localAudienceId,
        name: localAudienceName,
        value,
      };
      const hasLocalVote = currentState.audienceVotes.some(
        (vote) => vote.id === localAudienceId,
      );

      return {
        ...currentState,
        currentRole: "audience",
        audienceVotes: hasLocalVote
          ? currentState.audienceVotes.map((vote) =>
              vote.id === localAudienceId ? nextVote : vote,
            )
          : [nextVote, ...currentState.audienceVotes],
      };
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(71,184,255,0.16),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(255,107,154,0.13),transparent_30%),linear-gradient(135deg,#070914_0%,#0d1120_44%,#160f1f_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(71,184,255,0.055),transparent_28%,rgba(255,107,154,0.055)_78%,transparent)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-fuchsia-100/60">
              AUDIENCE CONSOLE
            </p>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              視聴者として参加
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-black">
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              エントランス
            </Link>
            <Link
              href="/speaker"
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              スピーカー
            </Link>
            <Link
              href="/stage"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-slate-100 transition hover:border-white/20 hover:bg-white/[0.1]"
            >
              画面共有
            </Link>
          </nav>
        </header>

        <BroadcastStage
          topic={meetingState.topic}
          leftLabel={meetingState.leftLabel}
          rightLabel={meetingState.rightLabel}
          speakers={meetingState.speakers}
          activeSpeakerId={meetingState.activeSpeakerId}
          audienceVotes={meetingState.audienceVotes}
          onActiveSpeakerChange={() => undefined}
        />

        <div className="mx-auto w-full max-w-5xl">
          <AudienceVotePanel
            votes={meetingState.audienceVotes}
            selectedValue={selectedAudienceValue}
            leftLabel={meetingState.leftLabel}
            rightLabel={meetingState.rightLabel}
            onVote={handleAudienceVote}
            onResetVotes={() => undefined}
            showReset={false}
          />
        </div>
      </div>
    </main>
  );
}
