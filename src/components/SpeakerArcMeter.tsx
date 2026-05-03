import { appConfig } from "@/config/app";
import type { SpeakerMeterParticipant } from "@/types/meeting";
import { cn } from "@/utils/classNames";
import { formatOpinionLabel } from "@/utils/formatOpinionLabel";
import {
  arcPolylinePoints,
  pointOnMeter,
  type MeterGeometry,
} from "@/utils/meterMath";

import { SpeakerAvatarMarker } from "./SpeakerAvatarMarker";

type SpeakerArcMeterProps = {
  speakers: SpeakerMeterParticipant[];
  activeSpeakerId: string;
  leftLabel: string;
  rightLabel: string;
  onActiveSpeakerChange: (speakerId: string) => void;
};

const viewBox = {
  width: 520,
  height: 340,
};

const geometry: MeterGeometry = appConfig.meter;

export function SpeakerArcMeter({
  speakers,
  activeSpeakerId,
  leftLabel,
  rightLabel,
  onActiveSpeakerChange,
}: SpeakerArcMeterProps) {
  const activeSpeaker = speakers.find((speaker) => speaker.id === activeSpeakerId);
  const activeValue = activeSpeaker?.value ?? 50;
  const basePoints = arcPolylinePoints(100, geometry, 136);
  const progressPoints = arcPolylinePoints(activeValue, geometry, 136);
  const tickValues = [0, 25, 50, 75, 100];
  const visibleSpeakers = speakers.slice(0, appConfig.maxSpeakers);

  return (
    <section className="rounded-lg border border-white/10 bg-slate-950/[0.58] p-5 shadow-panel backdrop-blur-xl sm:p-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-cyan-100/[0.65]">
            SPEAKER METER
          </p>
          <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
            話しながら動く立ち位置
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-bold text-slate-200">
          {activeSpeaker?.name ?? "スピーカー"}: {formatOpinionLabel(activeValue)}
        </div>
      </div>

      <div className="relative mx-auto aspect-[1.52/1] w-full max-w-[780px]">
        <svg
          viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
          role="img"
          aria-label={`選択中スピーカーの現在値は${activeValue}`}
          className="size-full overflow-visible"
        >
          <defs>
            <linearGradient id="meterBaseGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={appConfig.colors.left} stopOpacity="0.45" />
              <stop offset="50%" stopColor={appConfig.colors.middle} stopOpacity="0.45" />
              <stop offset="100%" stopColor={appConfig.colors.right} stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="meterProgressGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={appConfig.colors.left} />
              <stop offset="48%" stopColor={appConfig.colors.middle} />
              <stop offset="100%" stopColor={appConfig.colors.right} />
            </linearGradient>
            <filter id="meterGlow" x="-25%" y="-25%" width="150%" height="150%">
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
            stroke="url(#meterBaseGradient)"
            strokeLinecap="round"
            strokeWidth="30"
          />
          <polyline
            points={basePoints}
            fill="none"
            stroke="rgba(255,255,255,0.13)"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <polyline
            points={progressPoints}
            fill="none"
            filter="url(#meterGlow)"
            stroke="url(#meterProgressGradient)"
            strokeLinecap="round"
            strokeWidth="18"
          />

          {tickValues.map((tick) => {
            const point = pointOnMeter(tick, geometry);
            const isMain = tick === 0 || tick === 50 || tick === 100;

            return (
              <g key={tick}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isMain ? 6 : 4}
                  fill={isMain ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.52)"}
                />
                {isMain ? (
                  <text
                    x={point.x}
                    y={point.y + (tick === 50 ? -22 : 30)}
                    textAnchor="middle"
                    className="fill-slate-200 text-[18px] font-black"
                  >
                    {tick}
                  </text>
                ) : null}
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
              animationMs={appConfig.meter.animationMs}
              onSelect={() => onActiveSpeakerChange(speaker.id)}
            />
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 bottom-7 z-10 grid place-items-center sm:bottom-9">
          <div className="rounded-lg border border-white/10 bg-slate-950/[0.78] px-6 py-4 text-center shadow-[0_18px_55px_rgba(0,0,0,0.36)] backdrop-blur-md">
            <p className="text-xs font-bold tracking-[0.2em] text-slate-400">
              {activeSpeaker?.name ?? "CURRENT"}
            </p>
            <p className="text-6xl font-black leading-none text-white sm:text-7xl">
              {activeValue}
            </p>
            <p className="mt-2 text-sm font-bold text-cyan-100">
              {formatOpinionLabel(activeValue)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {visibleSpeakers.map((speaker) => {
          const isActive = speaker.id === activeSpeakerId;

          return (
            <button
              key={speaker.id}
              type="button"
              onClick={() => onActiveSpeakerChange(speaker.id)}
              className={cn(
                "grid min-h-12 grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border px-3 text-left transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
                isActive
                  ? "border-white bg-white text-slate-950"
                  : "border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.09]",
              )}
            >
              <span
                className="grid size-7 place-items-center rounded-full text-xs font-black text-slate-950"
                style={{ backgroundColor: speaker.color }}
              >
                {speaker.initial}
              </span>
              <span className="min-w-0 truncate text-sm font-black">
                {speaker.name}
              </span>
              <span className="text-sm font-black">{speaker.value}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm font-black sm:text-base">
        <span className="truncate text-cyan-100">{leftLabel}</span>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-slate-300">
          白黒つけない帯
        </span>
        <span className="truncate text-right text-rose-100">{rightLabel}</span>
      </div>
    </section>
  );
}
