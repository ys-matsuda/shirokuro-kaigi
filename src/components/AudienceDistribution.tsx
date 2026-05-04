import { appConfig } from "@/config/app";
import type { AudienceVote } from "@/types/meeting";
import { cn } from "@/utils/classNames";
import { formatAudienceMood, formatSoftAverage } from "@/utils/formatOpinionLabel";

type AudienceDistributionProps = {
  votes: AudienceVote[];
};

const buckets = Array.from({ length: 11 }, (_, index) => index * 10);

export function AudienceDistribution({ votes }: AudienceDistributionProps) {
  const counts = buckets.map(
    (bucket) => votes.filter((vote) => vote.value === bucket).length,
  );
  const maxCount = Math.max(1, ...counts);
  const total = votes.length;
  const mood = formatAudienceMood(votes);
  const softAverage = formatSoftAverage(votes);

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.082),rgba(255,255,255,0.045))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
      <div className="relative">
        <div className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full bg-fuchsia-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-14 top-28 size-44 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-fuchsia-100/60">
              ROOM MOOD
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">みんなの空気感</h2>
            <p className="mt-1 text-sm font-black text-cyan-100">{mood}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/45 px-4 py-3 text-right">
            <p className="text-3xl font-black leading-none text-white">{total}</p>
            <p className="mt-1 text-xs font-bold text-slate-400">人が置いた</p>
          </div>
        </div>

        <div
          className="relative rounded-lg border border-white/10 bg-slate-950/38 px-3 pb-4 pt-5"
          aria-label="視聴者分布"
        >
          <div className="pointer-events-none absolute inset-x-5 top-[46%] h-px bg-gradient-to-r from-cyan-200/0 via-amber-100/26 to-rose-200/0" />
          <div className="pointer-events-none absolute left-1/2 top-3 h-[calc(100%-2.2rem)] w-px -translate-x-1/2 bg-amber-100/20 shadow-[0_0_18px_rgba(243,210,111,0.28)]" />

          <div className="grid grid-cols-11 items-end gap-1.5 sm:gap-2">
            {buckets.map((bucket, index) => {
              const count = counts[index];
              const weight = count / maxCount;
              const height = count ? 22 + weight * 114 : 12;
              const isMiddle = bucket === 50;
              const dotCount = Math.min(4, count);

              return (
                <div key={bucket} className="grid min-w-0 gap-2">
                  <div className="relative flex h-40 items-end justify-center">
                    <div
                      className="absolute bottom-1 w-full max-w-9 rounded-full blur-md"
                      style={{
                        height,
                        background: count
                          ? `linear-gradient(180deg, ${appConfig.colors.right}55, ${appConfig.colors.middle}4d 48%, ${appConfig.colors.left}55)`
                          : "transparent",
                        opacity: count ? 0.34 + weight * 0.34 : 0,
                      }}
                    />
                    <div
                      className={cn(
                        "relative flex w-full max-w-8 flex-col-reverse items-center gap-1 rounded-full border p-1 transition-all duration-500",
                        count
                          ? "border-white/24 bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                          : "border-white/10 bg-white/[0.025]",
                        isMiddle && "border-amber-100/35",
                      )}
                      style={{
                        height,
                      }}
                      title={`${bucket}: ${count}人`}
                    >
                      {Array.from({ length: dotCount }, (_, dotIndex) => (
                        <span
                          key={dotIndex}
                          className="size-2 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.28)]"
                        />
                      ))}
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-center text-[11px] font-black",
                      isMiddle ? "text-amber-100" : "text-slate-400",
                    )}
                  >
                    {bucket}
                  </p>
                  <p className="text-center text-xs font-black text-white/90">{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-slate-500">
              空気の重心
            </p>
            <p className="mt-1 text-3xl font-black leading-none text-white">
              {softAverage}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold tracking-[0.16em] text-slate-500">
              見え方
            </p>
            <p className="mt-1 font-black text-cyan-100">{mood}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
