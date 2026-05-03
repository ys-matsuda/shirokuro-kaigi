import type { CSSProperties } from "react";

import { appConfig } from "@/config/app";
import type { AudienceVote, SpeakerMeterParticipant } from "@/types/meeting";
import { cn } from "@/utils/classNames";
import {
  formatAudienceMood,
  formatOpinionLabel,
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
  fullscreen?: boolean;
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
  fullscreen = false,
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
  const stageStyle = {
    width: fullscreen
      ? "min(100vw, calc(100vh * 16 / 9))"
      : "min(100%, 1221px, calc((100vh - 132px) * 16 / 9))",
    "--stage-room": fullscreen
      ? "clamp(0.86rem, 1.08vw, 1.3rem)"
      : "clamp(0.72rem, 1.08vw, 0.92rem)",
    "--stage-title": fullscreen
      ? "clamp(1.65rem, 2.2vw, 2.75rem)"
      : "clamp(1.35rem, 2.2vw, 2rem)",
    "--stage-share": fullscreen
      ? "clamp(0.78rem, 0.98vw, 1.15rem)"
      : "clamp(0.68rem, 0.98vw, 0.82rem)",
    "--stage-topic-label": fullscreen
      ? "clamp(0.86rem, 1.05vw, 1.25rem)"
      : "clamp(0.72rem, 1.05vw, 0.92rem)",
    "--stage-topic": fullscreen
      ? "clamp(3.7rem, 5.2vw, 6.7rem)"
      : "clamp(2.8rem, 5.2vw, 4.4rem)",
    "--stage-current-name": fullscreen
      ? "clamp(0.8rem, 0.95vw, 1.15rem)"
      : "clamp(0.68rem, 0.95vw, 0.84rem)",
    "--stage-current-value": fullscreen
      ? "clamp(4.25rem, 6.2vw, 7.8rem)"
      : "clamp(3.5rem, 6.2vw, 5.2rem)",
    "--stage-side-title": fullscreen
      ? "clamp(0.8rem, 1vw, 1.18rem)"
      : "clamp(0.66rem, 1vw, 0.86rem)",
    "--stage-side-number": fullscreen
      ? "clamp(2.3rem, 3.25vw, 4rem)"
      : "clamp(1.9rem, 3.25vw, 2.75rem)",
    "--stage-avg-number": fullscreen
      ? "clamp(2rem, 2.75vw, 3.35rem)"
      : "clamp(1.7rem, 2.75vw, 2.25rem)",
    "--stage-side-card-pad": fullscreen
      ? "clamp(0.95rem, 1.08vw, 1.35rem)"
      : "clamp(0.72rem, 1.08vw, 0.96rem)",
    "--stage-histogram": fullscreen
      ? "clamp(5.2rem, 6.7vw, 8.2rem)"
      : "clamp(4.2rem, 6.7vw, 5.6rem)",
    "--stage-list-row": fullscreen
      ? "clamp(2.8rem, 3.2vw, 3.85rem)"
      : "clamp(2.35rem, 3.2vw, 2.72rem)",
    "--stage-avatar-active": fullscreen
      ? "clamp(4rem, 6.15vw, 7.45rem)"
      : "clamp(4rem, 6.15vw, 4.85rem)",
    "--stage-avatar": fullscreen
      ? "clamp(2.75rem, 4.35vw, 5.25rem)"
      : "clamp(2.75rem, 4.35vw, 3.35rem)",
    "--stage-avatar-text": fullscreen
      ? "clamp(1.05rem, 1.55vw, 1.85rem)"
      : "clamp(1.05rem, 1.55vw, 1.25rem)",
    "--stage-avatar-badge": fullscreen
      ? "clamp(0.68rem, 0.9vw, 1.08rem)"
      : "clamp(0.62rem, 0.9vw, 0.75rem)",
    "--stage-avatar-badge-offset": fullscreen
      ? "clamp(1.35rem, 1.85vw, 2.2rem)"
      : "clamp(1.1rem, 1.85vw, 1.4rem)",
  } as CSSProperties & Record<string, string>;

  return (
    <section
      className={cn("mx-auto", fullscreen && "grid place-items-center")}
      style={stageStyle}
      aria-label="配信用16:9ステージ"
    >
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden border border-white/10 bg-slate-950 shadow-panel",
          fullscreen ? "rounded-none" : "rounded-lg",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(71,184,255,0.22),transparent_32%),radial-gradient(circle_at_84%_24%,rgba(255,107,154,0.18),transparent_30%),linear-gradient(135deg,rgba(8,10,19,0.96),rgba(17,20,36,0.98))]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

        <div className="relative z-10 h-full">
          <div className="absolute left-[2.25%] top-[4.15%] min-w-0">
            <p className="text-[var(--stage-room)] font-black tracking-[0.24em] text-cyan-100/70">
              {appConfig.roomName}
            </p>
            <h1 className="truncate text-[var(--stage-title)] font-black leading-tight text-white">
              {appConfig.name}
            </h1>
          </div>

          <div className="absolute right-[2.25%] top-[5.55%] inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-[1.1%] py-[0.55%] text-[var(--stage-share)] font-black text-slate-200">
            <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.8)]" />
            16:9 SHARE
          </div>

          <div className="absolute left-[2.25%] top-[14.9%] w-[69%]">
            <p className="text-[var(--stage-topic-label)] font-black tracking-[0.22em] text-slate-400">
              現在のお題
            </p>
            <p
              className="mt-[0.28em] text-balance font-black text-white"
              style={{ fontSize: "var(--stage-topic)", lineHeight: 1.04 }}
            >
              {topic}
            </p>
          </div>

          <div className="absolute left-[8.9%] top-[27.4%] aspect-[26/17] w-[53.5%]">
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
                <filter id="broadcastMeterGlow" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <polyline
                points={basePoints}
                fill="none"
                stroke="url(#broadcastBaseGradient)"
                strokeLinecap="round"
                strokeWidth="30"
              />
              <polyline
                points={progressPoints}
                fill="none"
                filter="url(#broadcastMeterGlow)"
                stroke="url(#broadcastProgressGradient)"
                strokeLinecap="round"
                strokeWidth="18"
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
                      className="fill-slate-100 text-[18px] font-black"
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

            <div className="pointer-events-none absolute inset-x-0 bottom-[7%] grid place-items-center">
              <div className="rounded-lg border border-white/10 bg-slate-950/[0.78] px-[clamp(1rem,1.45vw,1.8rem)] py-[clamp(0.65rem,0.85vw,1.05rem)] text-center shadow-[0_18px_55px_rgba(0,0,0,0.36)] backdrop-blur-md">
                <p className="text-[var(--stage-current-name)] font-black tracking-[0.18em] text-slate-400">
                  {activeSpeaker?.name ?? "CURRENT"}
                </p>
                <p className="text-[var(--stage-current-value)] font-black leading-none text-white">
                  {activeValue}
                </p>
                <p className="text-[var(--stage-topic-label)] font-black text-cyan-100">
                  {formatOpinionLabel(activeValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-[2.25%] bottom-[4.4%] grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[var(--stage-topic-label)] font-black">
            <span className="truncate text-cyan-100">{leftLabel}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-[1.1%] py-[0.4%] text-slate-300">
              白黒つけない帯
            </span>
            <span className="truncate text-right text-rose-100">{rightLabel}</span>
          </div>

          <aside
            className={cn(
              "absolute right-[2.25%] top-[13.9%] w-[25.2%] rounded-lg border border-white/10 bg-white/[0.06] p-[var(--stage-side-card-pad)]",
              !fullscreen && "hidden md:block",
            )}
          >
            <p className="text-[var(--stage-side-title)] font-black tracking-[0.18em] text-slate-400">
              ROOM MOOD
            </p>
            <div className="mt-[3%] flex items-end justify-between gap-2">
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
                <p className="text-[var(--stage-avg-number)] font-black leading-none text-white">
                  {formatSoftAverage(audienceVotes)}
                </p>
              </div>
            </div>
            <div className="mt-[6%] grid h-[var(--stage-histogram)] grid-cols-11 items-end gap-[2.3%]">
              {buckets.map((bucket, index) => {
                const count = counts[index];
                const height = count ? `${24 + (count / maxCount) * 76}%` : "9%";

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
          </aside>

          <aside
            className={cn(
              "absolute bottom-[3.7%] right-[2.25%] grid w-[25.2%] gap-[clamp(0.42rem,0.7vw,0.82rem)]",
              !fullscreen && "hidden md:grid",
            )}
          >
            {visibleSpeakers.map((speaker) => {
              const isActive = speaker.id === activeSpeakerId;

              return (
                <button
                  key={speaker.id}
                  type="button"
                  onClick={() => onActiveSpeakerChange(speaker.id)}
                  className={cn(
                    "grid min-h-[var(--stage-list-row)] grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border px-[clamp(0.75rem,1vw,1.25rem)] text-left transition",
                    isActive
                      ? "border-white bg-white text-slate-950"
                      : "border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.09]",
                  )}
                >
                  <span
                    className="grid size-[clamp(1.45rem,2.1vw,2.35rem)] place-items-center rounded-full text-[clamp(0.62rem,0.8vw,0.9rem)] font-black text-slate-950"
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
          </aside>
        </div>
      </div>
    </section>
  );
}
