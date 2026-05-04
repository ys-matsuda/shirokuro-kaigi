"use client";

import { UserRoundCheck } from "lucide-react";

import type { AudienceVote } from "@/types/meeting";
import { cn } from "@/utils/classNames";

import { AudienceDistribution } from "./AudienceDistribution";

type AudienceVotePanelProps = {
  votes: AudienceVote[];
  selectedValue: number | null;
  leftLabel: string;
  rightLabel: string;
  onVote: (value: number) => void;
  onResetVotes: () => void;
  showReset?: boolean;
};

const voteValues = Array.from({ length: 11 }, (_, index) => index * 10);

export function AudienceVotePanel({
  votes,
  selectedValue,
  leftLabel,
  rightLabel,
  onVote,
  onResetVotes,
  showReset = true,
}: AudienceVotePanelProps) {
  return (
    <div className="grid gap-4">
      <AudienceDistribution
        votes={votes}
        leftLabel={leftLabel}
        rightLabel={rightLabel}
      />

      <section className="rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.078),rgba(255,255,255,0.044))] p-5 shadow-panel backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-cyan-100/60">
              AUDIENCE
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">視聴者として置く</h2>
          </div>
          {showReset ? (
            <button
              type="button"
              onClick={onResetVotes}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-slate-100 transition hover:border-white/20 hover:bg-white/[0.1]"
              title="視聴者投票を空にする"
            >
              <UserRoundCheck aria-hidden="true" className="size-4" />
              空にする
            </button>
          ) : null}
        </div>

        <div className="mb-3 grid grid-cols-[1fr_auto_1fr] text-sm font-bold">
          <span className="truncate text-cyan-100">{leftLabel}</span>
          <span className="text-slate-500">10刻み</span>
          <span className="truncate text-right text-rose-100">{rightLabel}</span>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6">
          {voteValues.map((voteValue) => {
            const selected = selectedValue === voteValue;

            return (
              <button
                key={voteValue}
                type="button"
                aria-pressed={selected}
                onClick={() => onVote(voteValue)}
                className={cn(
                  "min-h-12 rounded-lg border text-base font-black transition",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
                  selected
                    ? "border-white bg-[linear-gradient(180deg,#ffffff,#dbeafe)] text-slate-950 shadow-[0_0_26px_rgba(255,255,255,0.22)]"
                    : "border-white/10 bg-slate-950/[0.58] text-slate-100 hover:border-white/20 hover:bg-white/[0.09]",
                )}
              >
                {voteValue}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-sm font-bold text-slate-400">
          {selectedValue === null
            ? "まだ自分の位置は置いていません。"
            : `自分の今の位置: ${selectedValue}`}
        </p>
      </section>
    </div>
  );
}
