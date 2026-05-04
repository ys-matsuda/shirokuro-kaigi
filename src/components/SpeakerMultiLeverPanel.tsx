"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

import { appConfig } from "@/config/app";
import type { SpeakerMeterParticipant } from "@/types/meeting";
import { cn } from "@/utils/classNames";
import { formatSpeakerMood } from "@/utils/formatOpinionLabel";
import { clampValue, roundMeterValue } from "@/utils/meterMath";

import { TickSoundToggle } from "./TickSoundToggle";

type SpeakerMultiLeverPanelProps = {
  speakers: SpeakerMeterParticipant[];
  activeSpeakerId: string;
  leftLabel: string;
  rightLabel: string;
  soundEnabled: boolean;
  onActiveSpeakerChange: (speakerId: string) => void;
  onSoundEnabledChange: (enabled: boolean) => void;
  onSpeakerValueChange: (speakerId: string, value: number) => void;
  onReset: () => void;
  onPrimeSound: () => void;
  onTick: (value: number) => void;
};

type SpeakerLeverRowProps = {
  speaker: SpeakerMeterParticipant;
  isActive: boolean;
  leftLabel: string;
  rightLabel: string;
  onActiveSpeakerChange: (speakerId: string) => void;
  onSpeakerValueChange: (speakerId: string, value: number) => void;
  onPrimeSound: () => void;
  onTick: (value: number) => void;
};

function SpeakerLeverRow({
  speaker,
  isActive,
  leftLabel,
  rightLabel,
  onActiveSpeakerChange,
  onSpeakerValueChange,
  onPrimeSound,
  onTick,
}: SpeakerLeverRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
      onSpeakerValueChange(speaker.id, safeValue);
      onTick(safeValue);
    },
    [onSpeakerValueChange, onTick, speaker.id],
  );

  return (
    <div
      className={cn(
        "rounded-lg border bg-slate-950/58 p-4 transition",
        isActive
          ? "border-white/30 shadow-[0_0_32px_rgba(255,255,255,0.08)]"
          : "border-white/10",
      )}
    >
      <div className="mb-4 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <button
          type="button"
          onClick={() => onActiveSpeakerChange(speaker.id)}
          className="grid size-11 place-items-center rounded-full border border-white/20 font-black text-slate-950 shadow-[0_12px_30px_rgba(0,0,0,0.34)] transition hover:brightness-110"
          style={{ backgroundColor: speaker.color }}
          title={`${speaker.name}をステージの主表示にする`}
        >
          {speaker.initial}
        </button>
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-white">{speaker.name}</p>
          <p className="truncate text-sm font-bold text-cyan-100">
            {formatSpeakerMood(speaker.value, leftLabel, rightLabel)}
          </p>
        </div>
        <div className="min-w-14 text-right text-3xl font-black leading-none text-white">
          {speaker.value}
        </div>
      </div>

      <div
        ref={trackRef}
        role="slider"
        aria-label={`${speaker.name}のレバー`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={speaker.value}
        tabIndex={0}
        onPointerDown={(event) => {
          onActiveSpeakerChange(speaker.id);
          onPrimeSound();
          setIsDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromClientX(event.clientX);
        }}
        onPointerMove={(event) => {
          if (!isDragging) return;
          updateFromClientX(event.clientX);
        }}
        onPointerUp={(event) => {
          setIsDragging(false);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => setIsDragging(false)}
        onKeyDown={(event) => {
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
          onActiveSpeakerChange(speaker.id);
          onPrimeSound();
          const nextValue =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? 100
                : clampValue(speaker.value + change);
          onSpeakerValueChange(speaker.id, nextValue);
          onTick(nextValue);
        }}
        className="group relative h-16 touch-none select-none outline-none"
      >
        <div className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/85 shadow-inner shadow-black">
          <div
            className="h-full rounded-full opacity-95"
            style={{
              ...gradientStyle,
              clipPath: `inset(0 ${100 - speaker.value}% 0 0 round 999px)`,
            }}
          />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-9 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/42 shadow-[0_0_16px_rgba(243,210,111,0.38)]" />
        <div
          className={cn(
            "absolute top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/45 bg-slate-950 text-base font-black text-white shadow-[0_16px_44px_rgba(0,0,0,0.42)] transition-transform",
            isDragging ? "scale-[1.08]" : "group-hover:scale-[1.035]",
          )}
          style={{
            left: `${speaker.value}%`,
            boxShadow: `0 16px 44px rgba(0,0,0,0.42), 0 0 30px ${speaker.color}55, inset 0 1px 0 rgba(255,255,255,0.18)`,
            transition:
              "left 150ms cubic-bezier(0.16, 1, 0.3, 1), transform 120ms ease, box-shadow 160ms ease",
          }}
        >
          <span
            className="grid size-[calc(100%-10px)] place-items-center rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]"
            style={{ outline: `2px solid ${speaker.color}44` }}
          >
            {speaker.value}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SpeakerMultiLeverPanel({
  speakers,
  activeSpeakerId,
  leftLabel,
  rightLabel,
  soundEnabled,
  onActiveSpeakerChange,
  onSoundEnabledChange,
  onSpeakerValueChange,
  onReset,
  onPrimeSound,
  onTick,
}: SpeakerMultiLeverPanelProps) {
  const visibleSpeakers = speakers.slice(0, appConfig.maxSpeakers);

  return (
    <section className="rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.085),rgba(255,255,255,0.045))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.22em] text-cyan-100/[0.65]">
            HAND LEVERS
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">スピーカー操作</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <TickSoundToggle enabled={soundEnabled} onChange={onSoundEnabledChange} />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-slate-100 transition hover:border-white/20 hover:bg-white/[0.1]"
            title="スピーカーメーターを初期値に戻す"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            リセット
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {visibleSpeakers.map((speaker) => (
          <SpeakerLeverRow
            key={speaker.id}
            speaker={speaker}
            isActive={speaker.id === activeSpeakerId}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            onActiveSpeakerChange={onActiveSpeakerChange}
            onSpeakerValueChange={onSpeakerValueChange}
            onPrimeSound={onPrimeSound}
            onTick={onTick}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm font-bold text-slate-300">
        <span className="truncate text-cyan-100">{leftLabel}</span>
        <span className="text-slate-400">各自のレバーを操作</span>
        <span className="truncate text-right text-rose-100">{rightLabel}</span>
      </div>
    </section>
  );
}
