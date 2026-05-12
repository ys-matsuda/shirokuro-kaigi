"use client";

import Link from "next/link";
import { ArrowRight, Mic2, UsersRound } from "lucide-react";

import { appConfig } from "@/config/app";
import { useSyncedMeetingState } from "@/hooks/useSyncedMeetingState";
import { formatAudienceMood } from "@/utils/formatOpinionLabel";
import { isRoomExpired } from "@/utils/roomExpiry";

import { RoomExpiredView } from "./RoomExpiredView";

type EntryPageViewProps = {
  roomId?: string;
  speakerHref?: string;
  audienceHref?: string;
};

export function EntryPageView({
  roomId = appConfig.defaultRoomId,
  speakerHref = "/speaker",
  audienceHref = "/audience",
}: EntryPageViewProps) {
  const [meetingState] = useSyncedMeetingState(roomId);
  const isExpired = isRoomExpired(meetingState.expiresAt);
  const entryLinks = [
    {
      href: speakerHref,
      title: "スピーカー参加",
      icon: Mic2,
      accent: "from-cyan-200/18 via-violet-200/12 to-white/[0.04]",
    },
    {
      href: audienceHref,
      title: "視聴者参加",
      icon: UsersRound,
      accent: "from-rose-200/18 via-amber-200/12 to-white/[0.04]",
    },
  ];

  if (isExpired) {
    return <RoomExpiredView />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(71,184,255,0.18),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(255,107,154,0.14),transparent_31%),linear-gradient(135deg,#070914_0%,#0d1120_46%,#160f1f_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(71,184,255,0.055),transparent_27%,rgba(255,107,154,0.055)_78%,transparent)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-5xl content-center gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <div>
            <p className="text-sm font-black tracking-[0.24em] text-cyan-100/65">
              ROOM ENTRANCE
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-6xl">
              {appConfig.name}
            </h1>
          </div>
        </header>

        <section className="grid gap-5">
          <div className="rounded-lg border border-white/10 bg-white/[0.065] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl sm:p-7">
            <p className="text-xs font-black tracking-[0.22em] text-cyan-100/55">
              現在のお題
            </p>
            <p className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">
              {meetingState.topic}
            </p>

            <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <span className="truncate text-base font-black text-cyan-100">
                {meetingState.leftLabel}
              </span>
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-black text-amber-100">
                50
              </span>
              <span className="truncate text-right text-base font-black text-rose-100">
                {meetingState.rightLabel}
              </span>
            </div>

            <div className="mt-4 h-4 overflow-hidden rounded-full border border-white/10 bg-slate-950/70">
              <div className="h-full bg-[linear-gradient(90deg,#47b8ff,#f3d26f_50%,#ff6b9a)]" />
            </div>

            <div className="mt-6 grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-slate-500">
                  SPEAKER
                </p>
                <p className="mt-1 text-xl font-black text-white">
                  {meetingState.speakers.length}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-slate-500">
                  AUDIENCE
                </p>
                <p className="mt-1 text-xl font-black text-white">
                  {meetingState.audienceVotes.length}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-slate-500">
                  MOOD
                </p>
                <p className="mt-1 truncate text-xl font-black text-cyan-100">
                  {formatAudienceMood(
                    meetingState.audienceVotes,
                    meetingState.leftLabel,
                    meetingState.rightLabel,
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {entryLinks.map((entry) => {
              const Icon = entry.icon;

              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={`group grid min-h-36 grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-white/10 bg-[linear-gradient(135deg,var(--tw-gradient-stops))] ${entry.accent} p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.07)] transition hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/[0.08] sm:p-6`}
                >
                  <span className="grid size-14 place-items-center rounded-lg border border-white/10 bg-slate-950/60 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <Icon aria-hidden="true" className="size-7" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-2xl font-black text-white sm:text-3xl">
                      {entry.title}
                    </span>
                  </span>
                  <span className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white transition group-hover:bg-white group-hover:text-slate-950">
                    <ArrowRight aria-hidden="true" className="size-5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
