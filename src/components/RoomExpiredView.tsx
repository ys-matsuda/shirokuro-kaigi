import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { appConfig } from "@/config/app";

export function RoomExpiredView() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-4 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(71,184,255,0.16),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(255,107,154,0.13),transparent_31%),linear-gradient(135deg,#070914_0%,#0d1120_46%,#160f1f_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative z-10 w-full max-w-xl rounded-lg border border-white/10 bg-white/[0.065] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl sm:p-8">
        <p className="text-xs font-black tracking-[0.24em] text-rose-100/65">
          ROOM EXPIRED
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">
          この会議は終了しました
        </h1>
        <p className="mt-4 text-sm font-bold leading-7 text-slate-300 sm:text-base">
          発行から{appConfig.roomLifetimeHours}時間を過ぎたため、このルームは使えません。
          新しい会議URLを発行してください。
        </p>
        <Link
          href="/"
          className="mt-6 inline-grid min-h-12 grid-cols-[1fr_auto] items-center gap-3 rounded-full border border-cyan-100/20 bg-cyan-100 px-5 text-sm font-black text-slate-950 transition hover:bg-white"
        >
          会議作成へ
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
    </main>
  );
}
