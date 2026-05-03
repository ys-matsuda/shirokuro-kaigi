"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { KeyRound, Lock, Mic2, ShieldCheck, Unlock } from "lucide-react";

import { appConfig } from "@/config/app";
import { cn } from "@/utils/classNames";

export type AccessState = {
  hostUnlocked: boolean;
  speakerUnlocked: boolean;
  speakerControlEnabled: boolean;
};

type AccessPanelProps = {
  access: AccessState;
  canManageAccess: boolean;
  onAccessChange: (access: AccessState) => void;
};

export function AccessPanel({
  access,
  canManageAccess,
  onAccessChange,
}: AccessPanelProps) {
  const [hostKey, setHostKey] = useState("");
  const [speakerKey, setSpeakerKey] = useState("");
  const [message, setMessage] = useState("試作キー: host-demo / speaker-demo");

  function unlockHost() {
    if (hostKey.trim() !== appConfig.access.hostKey) {
      setMessage("ホストキーが違います");
      return;
    }

    onAccessChange({ ...access, hostUnlocked: true });
    setHostKey("");
    setMessage("ホスト権限を解除しました");
  }

  function unlockSpeaker() {
    if (speakerKey.trim() !== appConfig.access.speakerKey) {
      setMessage("スピーカーキーが違います");
      return;
    }

    onAccessChange({ ...access, speakerUnlocked: true });
    setSpeakerKey("");
    setMessage("スピーカー権限を解除しました");
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-panel backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-emerald-100/60">
            ACCESS
          </p>
          <h2 className="mt-1 text-xl font-black text-white">権限</h2>
        </div>
        <div className="grid size-10 place-items-center rounded-full border border-emerald-200/20 bg-emerald-200/10 text-emerald-100">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
      </div>

      <div className="grid gap-2">
        <AccessRow
          icon={<ShieldCheck aria-hidden="true" className="size-4" />}
          label="ホスト"
          unlocked={access.hostUnlocked}
          disabled={!canManageAccess}
          onLock={() => {
            onAccessChange({ ...access, hostUnlocked: false });
            setMessage("ホスト権限をロックしました");
          }}
        />
        <AccessRow
          icon={<Mic2 aria-hidden="true" className="size-4" />}
          label="スピーカー"
          unlocked={access.speakerUnlocked}
          disabled={!canManageAccess}
          onLock={() => {
            onAccessChange({ ...access, speakerUnlocked: false });
            setMessage("スピーカー権限をロックしました");
          }}
        />
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-2 text-sm font-bold text-slate-300">
          ホストキー
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              value={hostKey}
              onChange={(event) => setHostKey(event.target.value)}
              className="min-h-11 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm font-bold text-white outline-none transition focus:border-emerald-200/50"
              type="password"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={unlockHost}
              className="grid min-h-11 place-items-center rounded-lg border border-white/10 bg-white/[0.06] px-3 text-slate-100 transition hover:bg-white/[0.1]"
              title="ホスト権限を解除"
            >
              <KeyRound aria-hidden="true" className="size-4" />
            </button>
          </div>
        </label>

        <label className="grid gap-2 text-sm font-bold text-slate-300">
          スピーカーキー
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              value={speakerKey}
              onChange={(event) => setSpeakerKey(event.target.value)}
              className="min-h-11 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm font-bold text-white outline-none transition focus:border-cyan-200/50"
              type="password"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={unlockSpeaker}
              className="grid min-h-11 place-items-center rounded-lg border border-white/10 bg-white/[0.06] px-3 text-slate-100 transition hover:bg-white/[0.1]"
              title="スピーカー権限を解除"
            >
              <KeyRound aria-hidden="true" className="size-4" />
            </button>
          </div>
        </label>

        <button
          type="button"
          disabled={!canManageAccess}
          onClick={() => {
            onAccessChange({
              ...access,
              speakerControlEnabled: !access.speakerControlEnabled,
            });
            setMessage(
              access.speakerControlEnabled
                ? "スピーカー操作を一時停止しました"
                : "スピーカー操作を再開しました",
            );
          }}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-black transition",
            !canManageAccess && "cursor-not-allowed opacity-55",
            access.speakerControlEnabled
              ? "border-cyan-200/20 bg-cyan-200/10 text-cyan-50"
              : "border-white/10 bg-slate-950/70 text-slate-300",
          )}
        >
          {access.speakerControlEnabled ? (
            <Unlock aria-hidden="true" className="size-4" />
          ) : (
            <Lock aria-hidden="true" className="size-4" />
          )}
          スピーカー操作 {access.speakerControlEnabled ? "ON" : "OFF"}
        </button>
      </div>

      <p className="mt-3 text-sm font-bold text-slate-400">
        {canManageAccess ? message : `${message} / 変更はホスト役で`}
      </p>
    </section>
  );
}

function AccessRow({
  icon,
  label,
  unlocked,
  disabled,
  onLock,
}: {
  icon: ReactNode;
  label: string;
  unlocked: boolean;
  disabled: boolean;
  onLock: () => void;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-slate-950/[0.52] px-3 py-2">
      <span className="text-slate-300">{icon}</span>
      <span className="text-sm font-black text-white">{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onLock}
        className={cn(
          "inline-flex min-h-8 items-center gap-1 rounded-full border px-3 text-xs font-black transition",
          disabled && "cursor-not-allowed opacity-55",
          unlocked
            ? "border-emerald-200/30 bg-emerald-200/10 text-emerald-100"
            : "border-white/10 bg-white/[0.04] text-slate-400",
        )}
      >
        {unlocked ? (
          <Unlock aria-hidden="true" className="size-3" />
        ) : (
          <Lock aria-hidden="true" className="size-3" />
        )}
        {unlocked ? "解除中" : "ロック中"}
      </button>
    </div>
  );
}
