import type { CSSProperties } from "react";

import { appConfig } from "@/config/app";
import type { AudienceVote, SpeakerMeterParticipant } from "@/types/meeting";
import { cn } from "@/utils/classNames";
import {
  formatAudienceMood,
  formatSoftAverage,
} from "@/utils/formatOpinionLabel";
import {
  arcPolylinePoints,
  pointOnMeter,
  type MeterGeometry,
} from "@/utils/meterMath";

import { SpeakerAvatarMarker } from "./SpeakerAvatarMarker";

type BroadcastStageProps = {
  topic: string;
  leftLabel: string;
  rightLabel: string;
  speakers: SpeakerMeterParticipant[];
  activeSpeakerId: string;
  audienceVotes: AudienceVote[];
  onActiveSpeakerChange: (speakerId: string) => void;
};

const viewBox = {
  width: 520,
  height: 340,
};

const geometry: MeterGeometry = appConfig.meter;
const buckets = Array.from({ length: 11 }, (_, index) => index * 10);

export function BroadcastStage({
  topic,
  leftLabel,
  rightLabel,
  speakers,
  activeSpeakerId,
  audienceVotes,
  onActiveSpeakerChange,
}: BroadcastStageProps) {
  const activeSpeaker = speakers.find((speaker) => speaker.id === activeSpeakerId);
  const activeValue = activeSpeaker?.value ?? 50;
  const visibleSpeakers = speakers.slice(0, appConfig.maxSpeakers);
  const basePoints = arcPolylinePoints(100, geometry, 136);
  const progressPoints = arcPolylinePoints(activeValue, geometry, 136);
  const counts = buckets.map(
    (bucket) => audienceVotes.filter((vote) => vote.value === bucket).length,
  );
  const maxCount = Math.max(1, ...counts);
  const topicTextStyle: CSSProperties = {
    fontSize: "clamp(1.38rem, 2.7cqw, 2.7rem)",
    lineHeight: 1.04,
  };
  const stageStyle = {
    width: "min(100%, 1280px, calc(177.78vh - 235px))",
    "--stage-pad": "clamp(1rem, 2.05cqw, 2.55rem)",
    "--stage-gap": "clamp(0.75rem, 1.25cqw, 1.6rem)",
    "--stage-room": "clamp(0.66rem, 1.02cqw, 1.24rem)",
    "--stage-title": "clamp(0.625rem, 1.125cqw, 1.375rem)",
    "--stage-topic-label": "clamp(0.72rem, 1.08cqw, 1.32rem)",
    "--stage-side-title": "clamp(0.68rem, 1.02cqw, 1.24rem)",
    "--stage-side-number": "clamp(1.8rem, 3.45cqw, 4.2rem)",
    "--stage-avg-number": "clamp(1.55rem, 2.85cqw, 3.5rem)",
    "--stage-side-card-pad": "clamp(0.75rem, 1.08cqw, 1.35rem)",
    "--stage-histogram": "clamp(4.9rem, 6.55cqw, 8rem)",
    "--stage-list-row": "clamp(2.5rem, 3.35cqw, 4.05rem)",
  } as CSSProperties & Record<string, string>;

  return (
    <section
      className="mx-auto [container-type:inline-size]"
      style={stageStyle}
      aria-label="配信用16:9ステージ"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-[0_26px_90px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_26%,rgba(71,184,255,0.26),transparent_34%),radial-gradient(circle_at_46%_65%,rgba(243,210,111,0.10),transparent_30%),radial-gradient(circle_at_84%_24%,rgba(255,107,154,0.18),transparent_30%),linear-gradient(135deg,rgba(8,10,19,0.96),rgba(17,20,36,0.98))]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative z-10 flex h-full flex-col p-[var(--stage-pad)]">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[var(--stage-room)] font-black tracking-[0.24em] text-cyan-100/70">
                {appConfig.roomName}
              </p>
              <h1 className="truncate text-[var(--stage-title)] font-black text-white">
                {appConfig.name}
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-[clamp(0.75rem,1.2cqw,1.45rem)] py-[clamp(0.36rem,0.55cqw,0.72rem)] text-[var(--stage-side-title)] font-black text-slate-200">
              <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.8)]" />
              16:9 SHARE
            </div>
          </div>

          <div className="mt-[var(--stage-gap)] grid min-h-0 flex-1 gap-[var(--stage-gap)] grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(210px,0.36fr)]">
            <div className="grid min-w-0 grid-rows-[auto_minmax(0,1fr)_auto]">
              <div>
                <p className="text-[var(--stage-topic-label)] font-black tracking-[0.22em] text-cyan-100/55">
                  現在のお題
                </p>
                <p
                  className="mt-[0.25em] max-w-[13em] text-balance font-black text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                  style={topicTextStyle}
                >
                  {topic}
                </p>
              </div>

              <div className="relative min-h-0">
                <div className="pointer-events-none absolute inset-x-[9%] bottom-[20%] top-[10%] rounded-full bg-[radial-gradient(circle_at_50%_42%,rgba(243,210,111,0.12),transparent_35%),radial-gradient(circle_at_30%_70%,rgba(71,184,255,0.12),transparent_38%),radial-gradient(circle_at_74%_70%,rgba(255,107,154,0.12),transparent_38%)] blur-xl" />
                <div className="absolute inset-x-0 top-[1%] h-[80%]">
                  <svg
                    viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
                    role="img"
                    aria-label={`選択中スピーカーの現在値は${activeValue}`}
                    className="absolute inset-0 size-full overflow-visible"
                  >
                    <defs>
                      <linearGradient id="broadcastBaseGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor={appConfig.colors.left} stopOpacity="0.42" />
                        <stop offset="50%" stopColor={appConfig.colors.middle} stopOpacity="0.42" />
                        <stop offset="100%" stopColor={appConfig.colors.right} stopOpacity="0.42" />
                      </linearGradient>
                      <linearGradient id="broadcastProgressGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor={appConfig.colors.left} />
                        <stop offset="48%" stopColor={appConfig.colors.middle} />
                        <stop offset="100%" stopColor={appConfig.colors.right} />
                      </linearGradient>
                      <filter id="broadcastMeterGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <polyline
                      points={basePoints}
                      fill="none"
                      stroke="rgba(2,6,23,0.62)"
                      strokeLinecap="round"
                      strokeWidth="42"
                    />
                    <polyline
                      points={basePoints}
                      fill="none"
                      stroke="url(#broadcastBaseGradient)"
                      strokeLinecap="round"
                      strokeWidth="34"
                    />
                    <polyline
                      points={progressPoints}
                      fill="none"
                      filter="url(#broadcastMeterGlow)"
                      stroke="url(#broadcastProgressGradient)"
                      strokeLinecap="round"
                      strokeWidth="22"
                    />
                    {[0, 50, 100].map((tick) => {
                      const point = pointOnMeter(tick, geometry);

                      return (
                        <g key={tick}>
                          <circle cx={point.x} cy={point.y} r="6" fill="rgba(255,255,255,0.9)" />
                          <text
                            x={point.x}
                            y={point.y + (tick === 50 ? -24 : 30)}
                            textAnchor="middle"
                            className="fill-slate-50 text-[20px] font-black"
                          >
                            {tick}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {visibleSpeakers.map((speaker, index) => {
                    const speakerGeometry = {
                      ...geometry,
                      radius:
                        geometry.radius +
                        (appConfig.meter.speakerRadiusOffsets[index] ?? index * 8),
                    };
                    const point = pointOnMeter(speaker.value, speakerGeometry);

                    return (
                      <SpeakerAvatarMarker
                        key={speaker.id}
                        point={point}
                        viewBoxWidth={viewBox.width}
                        viewBoxHeight={viewBox.height}
                        value={speaker.value}
                        initial={speaker.initial}
                        name={speaker.name}
                        color={speaker.color}
                        avatarUrl={speaker.avatarUrl}
                        isActive={speaker.id === activeSpeakerId}
                        large
                        animationMs={appConfig.meter.animationMs}
                        onSelect={() => onActiveSpeakerChange(speaker.id)}
                      />
                    );
                  })}
                </div>

                <div className="pointer-events-none absolute inset-x-[18%] bottom-[12%] h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
              </div>

              <div className="grid gap-2 text-[var(--stage-topic-label)] font-black">
                <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-slate-950/50">
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(71,184,255,0.72),rgba(243,210,111,0.45)_50%,rgba(255,107,154,0.72))]" />
                  <div
                    className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white shadow-[0_0_20px_rgba(255,255,255,0.32)]"
                    style={{ left: `${activeValue}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 items-center gap-3">
                  <span className="truncate text-cyan-50">{leftLabel}</span>
                  <span className="truncate text-right text-rose-50">{rightLabel}</span>
                </div>
              </div>
            </div>

            <aside className="hidden min-w-0 content-between gap-3 md:grid">
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-[var(--stage-side-card-pad)]">
                <p className="text-[var(--stage-side-title)] font-black tracking-[0.18em] text-slate-400">
                  ROOM MOOD
                </p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[var(--stage-side-number)] font-black leading-none text-white">
                      {audienceVotes.length}
                      <span className="ml-1 text-[0.42em] text-slate-400">人</span>
                    </p>
                    <p className="mt-1 text-[var(--stage-topic-label)] font-black text-cyan-100">
                      {formatAudienceMood(audienceVotes)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--stage-side-title)] font-black text-slate-500">
                      AVG
                    </p>
                    <p className="text-[var(--stage-avg-number)] font-black text-white">
                      {formatSoftAverage(audienceVotes)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid h-[var(--stage-histogram)] grid-cols-11 items-end gap-1">
                  {buckets.map((bucket, index) => {
                    const count = counts[index];
                    const height = count ? `${22 + (count / maxCount) * 78}%` : "8%";

                    return (
                      <div key={bucket} className="flex h-full items-end justify-center">
                        <div
                          className={cn(
                            "w-full max-w-4 rounded-full border",
                            count
                              ? "border-white/20 bg-[linear-gradient(180deg,#ff6b9a,#f3d26f_52%,#47b8ff)]"
                              : "border-white/10 bg-white/[0.04]",
                          )}
                          style={{ height }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-[clamp(0.5rem,0.75cqw,0.9rem)]">
                {visibleSpeakers.map((speaker) => {
                  const isActive = speaker.id === activeSpeakerId;

                  return (
                    <button
                      key={speaker.id}
                      type="button"
                      onClick={() => onActiveSpeakerChange(speaker.id)}
                      className={cn(
                        "grid min-h-[var(--stage-list-row)] grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border px-[clamp(0.75rem,1cqw,1.25rem)] text-left transition",
                        isActive
                          ? "border-white bg-white text-slate-950"
                          : "border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.09]",
                      )}
                    >
                      <span
                        className="grid size-[clamp(1.5rem,2.1cqw,2.4rem)] place-items-center rounded-full text-[clamp(0.62rem,0.8cqw,0.9rem)] font-black text-slate-950"
                        style={{ backgroundColor: speaker.color }}
                      >
                        {speaker.initial}
                      </span>
                      <span className="min-w-0 truncate text-[var(--stage-topic-label)] font-black">
                        {speaker.name}
                      </span>
                      <span className="text-[var(--stage-topic-label)] font-black">
                        {speaker.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
