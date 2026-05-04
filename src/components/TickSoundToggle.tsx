"use client";

import { Volume2, VolumeX } from "lucide-react";

import { cn } from "@/utils/classNames";

type TickSoundToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function TickSoundToggle({ enabled, onChange }: TickSoundToggleProps) {
  const Icon = enabled ? Volume2 : VolumeX;

  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-bold transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
        enabled
          ? "border-cyan-200/30 bg-cyan-200/[0.12] text-cyan-50 shadow-[0_0_20px_rgba(71,184,255,0.12)]"
          : "border-white/10 bg-white/[0.05] text-slate-300",
      )}
      title={enabled ? "カチカチ音をOFF" : "カチカチ音をON"}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-full transition",
          enabled
            ? "bg-cyan-100 text-slate-950"
            : "bg-slate-900 text-slate-400",
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span>{enabled ? "音 ON" : "音 OFF"}</span>
    </button>
  );
}
