"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";

type HostAccessPanelProps = {
  isUnlocked: boolean;
  onUnlock: (hostKey: string) => boolean;
  onLock: () => void;
};

export function HostAccessPanel({
  isUnlocked,
  onUnlock,
  onLock,
}: HostAccessPanelProps) {
  const [hostKey, setHostKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (onUnlock(hostKey)) {
      setHostKey("");
      setErrorMessage("");
      return;
    }

    setErrorMessage("ホストキーが違います。");
  }

  return (
    <section className="rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.045))] p-5 shadow-panel backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.22em] text-emerald-100/60">
            HOST ACCESS
          </p>
          <h2 className="mt-1 text-xl font-black text-white">
            ホスト権限
          </h2>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-emerald-100">
          {isUnlocked ? (
            <ShieldCheck aria-hidden="true" className="size-5" />
          ) : (
            <Lock aria-hidden="true" className="size-5" />
          )}
        </span>
      </div>

      {isUnlocked ? (
        <div className="grid gap-3">
          <p className="text-sm font-bold leading-relaxed text-emerald-50">
            お題変更・初期化・スピーカー管理が使えます。
          </p>
          <button
            type="button"
            onClick={onLock}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-slate-100 transition hover:bg-white/[0.1]"
          >
            <Lock aria-hidden="true" className="size-4" />
            ロックする
          </button>
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-slate-300">
            ホストキー
            <input
              value={hostKey}
              onChange={(event) => {
                setHostKey(event.target.value);
                setErrorMessage("");
              }}
              type="password"
              autoComplete="off"
              className="min-h-12 rounded-lg border border-white/10 bg-slate-950/72 px-4 text-base font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-200/50"
              placeholder="ホストだけが入力"
            />
          </label>
          {errorMessage ? (
            <p className="text-sm font-bold text-rose-100">{errorMessage}</p>
          ) : (
            <p className="text-sm font-bold leading-relaxed text-slate-400">
              ロック中は、お題変更・初期化・スピーカー管理だけ使えません。
            </p>
          )}
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-base font-black text-slate-950 transition hover:bg-emerald-50"
          >
            <KeyRound aria-hidden="true" className="size-4" />
            ホストとして解除
          </button>
        </form>
      )}
    </section>
  );
}
