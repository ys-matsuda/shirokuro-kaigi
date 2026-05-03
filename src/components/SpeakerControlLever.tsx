"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

import { appConfig } from "@/config/app";
import type { SpeakerMeterParticipant } from "@/types/meeting";
import { cn } from "@/utils/classNames";
import { clampValue, roundMeterValue } from "@/utils/meterMath";

import { TickSoundToggle } from "./TickSoundToggle";

type SpeakerControlLeverProps = {
  value: number;
  activeSpeakerId: string;
  speakers: SpeakerMeterParticipant[];
  leftLabel: string;
  rightLabel: string;
  soundEnabled: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onActiveSpeakerChange: (speakerId: string) => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onValueChange: (value: number) => void;
  onReset: () => void;
  onPrimeSound: () => void;
  onTick: (value: number) => void;
};

const quickValues = [0, 25, 50, 75, 100];

export function SpeakerControlLever({
  value,
  activeSpeakerId,
  speakers,
  leftLabel,
  rightLabel,
  soundEnabled,
  disabled = false,
  disabledReason,
  onActiveSpeakerChange,
  onSoundEnabledChange,
  onValueChange,
  onReset,
  onPrimeSound,
  onTick,
}: SpeakerControlLeverProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const activeSpeaker = speakers.find((speaker) => speaker.id === activeSpeakerId);

  const gradientStyle = useMemo(
    () => ({
      background: `linear-gradient(90deg, ${appConfig.colors.left}, ${appConfig.colors.middle} 50%, ${appConfig.colors.right})`,
    }),
    [],
  );

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const next = roundMeterValue(((clientX - rect.left) / rect.width) * 100);
      const safeValue = clampValue(next);
      onValueChange(safeValue);
      onTick(safeValue);
    },
    [onTick, onValueChange],
  );

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-panel backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-cyan-100/[0.65]">
            HAND LEVER
          </p>
          <h2 className="mt-1 text-xl font-black text-white">手元のレバー</h2>
          <p className="mt-1 text-sm font-bold text-slate-400">
            操作中: {activeSpeaker?.name ?? "スピーカー"}
          </p>
          {disabledReason ? (
            <p className="mt-1 text-sm font-bold text-amber-100/70">
              {disabledReason}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <TickSoundToggle enabled={soundEnabled} onChange={onSoundEnabledChange} />
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-slate-100 transition hover:bg-white/[0.1]"
            title="スピーカーメーターを50に戻す"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            リセット
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {speakers.slice(0, appConfig.maxSpeakers).map((speaker) => {
          const isActive = speaker.id === activeSpeakerId;

          return (
            <button
              key={speaker.id}
              type="button"
              onClick={() => onActiveSpeakerChange(speaker.id)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-black transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
                isActive
                  ? "border-white bg-white text-slate-950"
                  : "border-white/10 bg-slate-950/60 text-slate-200 hover:bg-white/[0.09]",
              )}
            >
              <span
                className="grid size-6 shrink-0 place-items-center rounded-full text-[11px] text-slate-950"
                style={{ backgroundColor: speaker.color }}
              >
                {speaker.initial}
              </span>
              <span className="min-w-0 truncate">{speaker.name}</span>
            </button>
          );
        })}
      </div>

      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label="スピーカー用レバー"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={(event) => {
          if (disabled) return;
          onPrimeSound();
          setIsDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromClientX(event.clientX);
        }}
        onPointerMove={(event) => {
          if (disabled) return;
          if (!isDragging) return;
          updateFromClientX(event.clientX);
        }}
        onPointerUp={(event) => {
          setIsDragging(false);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => setIsDragging(false)}
        onKeyDown={(event) => {
          if (disabled) return;
          const keyChanges: Record<string, number> = {
            ArrowLeft: -1,
            ArrowRight: 1,
            PageDown: -10,
            PageUp: 10,
            Home: -100,
            End: 100,
          };

          const change = keyChanges[event.key];
          if (change === undefined) return;

          event.preventDefault();
          onPrimeSound();
          const nextValue =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? 100
                : clampValue(value + change);
          onValueChange(nextValue);
          onTick(nextValue);
        }}
        className={cn(
          "group relative h-24 touch-none select-none outline-none",
          disabled && "cursor-not-allowed opacity-55",
        )}
      >
        <div className="absolute left-0 right-0 top-1/2 h-4 -translate-y-1/2 rounded-full bg-slate-950/80 shadow-inner shadow-black">
          <div
            className="h-full rounded-full opacity-90"
            style={{
              ...gradientStyle,
              clipPath: `inset(0 ${100 - value}% 0 0 round 999px)`,
            }}
          />
        </div>
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
          {quickValues.map((tick) => (
            <button
              key={tick}
              type="button"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                onPrimeSound();
                onValueChange(tick);
                onTick(tick);
              }}
              className={cn(
                "grid size-7 place-items-center rounded-full border text-[10px] font-black transition sm:size-8",
                Math.abs(value - tick) <= 2
                  ? "border-white bg-white text-slate-950"
                  : "border-white/25 bg-slate-950 text-slate-200 hover:bg-white/[0.15]",
              )}
              title={`${tick}にする`}
            >
              {tick}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "absolute top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-slate-950 text-lg font-black text-white shadow-[0_16px_50px_rgba(0,0,0,0.42)] transition-transform",
            isDragging ? "scale-105" : "group-hover:scale-[1.03]",
          )}
          style={{
            left: `${value}%`,
            transition:
              "left 120ms cubic-bezier(0.2, 0.9, 0.2, 1), transform 120ms ease",
          }}
        >
          {value}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm font-bold text-slate-300">
        <span className="truncate text-cyan-100">{leftLabel}</span>
        <span className="text-slate-400">ドラッグで微調整</span>
        <span className="truncate text-right text-rose-100">{rightLabel}</span>
      </div>
    </section>
  );
}
