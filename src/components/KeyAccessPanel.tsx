"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";

type KeyAccessPanelProps = {
  eyebrow: string;
  title: string;
  label: string;
  placeholder: string;
  unlockedMessage: string;
  lockedMessage: string;
  errorMessage: string;
  unlockButtonLabel: string;
  lockButtonLabel?: string;
  tone?: "emerald" | "cyan";
  isUnlocked: boolean;
  onUnlock: (accessKey: string) => boolean;
  onLock: () => void;
};

const toneClasses = {
  emerald: {
    eyebrow: "text-emerald-100/60",
    icon: "text-emerald-100",
    focus: "focus:border-emerald-200/50",
    buttonHover: "hover:bg-emerald-50",
    unlockedText: "text-emerald-50",
  },
  cyan: {
    eyebrow: "text-cyan-100/60",
    icon: "text-cyan-100",
    focus: "focus:border-cyan-200/50",
    buttonHover: "hover:bg-cyan-50",
    unlockedText: "text-cyan-50",
  },
} as const;

export function KeyAccessPanel({
  eyebrow,
  title,
  label,
  placeholder,
  unlockedMessage,
  lockedMessage,
  errorMessage,
  unlockButtonLabel,
  lockButtonLabel = "ロックする",
  tone = "emerald",
  isUnlocked,
  onUnlock,
  onLock,
}: KeyAccessPanelProps) {
  const [accessKey, setAccessKey] = useState("");
  const [currentErrorMessage, setCurrentErrorMessage] = useState("");
  const classes = toneClasses[tone];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (onUnlock(accessKey)) {
      setAccessKey("");
      setCurrentErrorMessage("");
      return;
    }

    setCurrentErrorMessage(errorMessage);
  }

  return (
    <section className="rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.045))] p-5 shadow-panel backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-black tracking-[0.22em] ${classes.eyebrow}`}>
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-black text-white">{title}</h2>
        </div>
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] ${classes.icon}`}
        >
          {isUnlocked ? (
            <ShieldCheck aria-hidden="true" className="size-5" />
          ) : (
            <Lock aria-hidden="true" className="size-5" />
          )}
        </span>
      </div>

      {isUnlocked ? (
        <div className="grid gap-3">
          <p className={`text-sm font-bold leading-relaxed ${classes.unlockedText}`}>
            {unlockedMessage}
          </p>
          <button
            type="button"
            onClick={onLock}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-slate-100 transition hover:bg-white/[0.1]"
          >
            <Lock aria-hidden="true" className="size-4" />
            {lockButtonLabel}
          </button>
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            {label}
            <input
              value={accessKey}
              onChange={(event) => {
                setAccessKey(event.target.value);
                setCurrentErrorMessage("");
              }}
              type="password"
              autoComplete="off"
              className={`min-h-12 rounded-lg border border-white/10 bg-slate-950/72 px-4 text-base font-bold text-white outline-none transition placeholder:text-slate-500 ${classes.focus}`}
              placeholder={placeholder}
            />
          </label>
          {currentErrorMessage ? (
            <p className="text-sm font-bold text-rose-100">
              {currentErrorMessage}
            </p>
          ) : (
            <p className="text-sm font-bold leading-relaxed text-slate-400">
              {lockedMessage}
            </p>
          )}
          <button
            type="submit"
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-base font-black text-slate-950 transition ${classes.buttonHover}`}
          >
            <KeyRound aria-hidden="true" className="size-4" />
            {unlockButtonLabel}
          </button>
        </form>
      )}
    </section>
  );
}
