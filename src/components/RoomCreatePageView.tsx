"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Plus } from "lucide-react";

import { appConfig } from "@/config/app";
import { useKeyAccess } from "@/hooks/useKeyAccess";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  createMeetingRoomInSupabase,
  type CreatedMeetingRoom,
} from "@/services/supabaseRooms";

import { KeyAccessPanel } from "./KeyAccessPanel";

function formatExpiresAt(expiresAt: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(expiresAt));
}

export function RoomCreatePageView() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [createdRoom, setCreatedRoom] = useState<CreatedMeetingRoom | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const {
    isUnlocked: isHostUnlocked,
    unlock: unlockHost,
    lock: lockHost,
  } = useKeyAccess({
    accessKey: appConfig.access.hostKey,
    defaultUnlocked: appConfig.access.hostUnlockedByDefault,
    storageKey: "consensus-meter:host-access:v1",
  });

  const createdRoomUrl =
    typeof window === "undefined" || !createdRoom
      ? ""
      : `${window.location.origin}${createdRoom.entrancePath}`;

  async function handleCreateRoom() {
    if (!supabase || !isHostUnlocked || isCreating) return;

    setIsCreating(true);
    setErrorMessage("");
    setCopyState("idle");

    try {
      const nextRoom = await createMeetingRoomInSupabase(supabase);
      setCreatedRoom(nextRoom);
    } catch (error) {
      console.error("Room creation failed.", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "会議の作成に失敗しました。少し時間を置いてもう一度お試しください。",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCopyUrl() {
    if (!createdRoomUrl) return;

    try {
      await navigator.clipboard.writeText(createdRoomUrl);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("idle");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(71,184,255,0.18),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(255,107,154,0.14),transparent_31%),linear-gradient(135deg,#070914_0%,#0d1120_46%,#160f1f_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(71,184,255,0.055),transparent_27%,rgba(255,107,154,0.055)_78%,transparent)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-3xl content-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-5">
          <header>
            <p className="text-xs font-black tracking-[0.26em] text-cyan-100/65">
              ROOM CREATOR
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-6xl">
              {appConfig.name}
            </h1>
          </header>

          <KeyAccessPanel
            eyebrow="HOST ACCESS"
            title="会議作成権限"
            label="ホストキー"
            placeholder="ホストだけが入力"
            unlockedMessage="解除中"
            lockedMessage="ホストキーを入力"
            errorMessage="ホストキーが違います。"
            unlockButtonLabel="作成権限を解除"
            isUnlocked={isHostUnlocked}
            onUnlock={unlockHost}
            onLock={lockHost}
          />

          <div className="rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black tracking-[0.22em] text-cyan-100/55">
                  NEW MEETING
                </p>
                <h2 className="mt-2 text-3xl font-black text-white">
                  新しい会議を作成
                </h2>
              </div>
            </div>

            <button
              type="button"
              disabled={!supabase || !isHostUnlocked || isCreating}
              onClick={handleCreateRoom}
              className="mt-6 grid min-h-14 w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-cyan-100/20 bg-cyan-100 px-5 text-left text-lg font-black text-slate-950 shadow-[0_20px_70px_rgba(71,184,255,0.2)] transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.08] disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0"
            >
              <Plus aria-hidden="true" className="size-6" />
              <span>
                {isCreating
                  ? "作成中..."
                  : isHostUnlocked
                    ? "会議URLを発行する"
                    : "ホストキーを解除してください"}
              </span>
              <ArrowRight aria-hidden="true" className="size-5" />
            </button>

            {!supabase ? (
              <p className="mt-3 text-sm font-bold text-rose-100">
                Supabaseの環境変数が未設定のため、会議を作成できません。
              </p>
            ) : null}
            {errorMessage ? (
              <p className="mt-3 text-sm font-bold text-rose-100">
                {errorMessage}
              </p>
            ) : null}

            {createdRoom ? (
              <div className="mt-6 rounded-lg border border-cyan-100/20 bg-cyan-100/[0.08] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black tracking-[0.18em] text-cyan-100/70">
                      CREATED
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-300">
                      {formatExpiresAt(createdRoom.expiresAt)} まで有効
                    </p>
                  </div>
                  <Link
                    href={createdRoom.entrancePath}
                    className="inline-grid min-h-11 grid-cols-[1fr_auto] items-center gap-3 rounded-full border border-white/10 bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-cyan-100"
                  >
                    エントランスを開く
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    readOnly
                    value={createdRoomUrl}
                    className="min-h-12 rounded-lg border border-white/10 bg-slate-950/70 px-4 text-sm font-bold text-cyan-50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-grid min-h-12 grid-cols-[auto_1fr] items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-4 text-sm font-black text-white transition hover:bg-white/[0.13]"
                  >
                    {copyState === "copied" ? (
                      <Check aria-hidden="true" className="size-4 text-cyan-100" />
                    ) : (
                      <Copy aria-hidden="true" className="size-4" />
                    )}
                    {copyState === "copied" ? "コピー済み" : "URLをコピー"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
