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

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-panel backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-fuchsia-100/60">
            ROOM MOOD
          </p>
          <h2 className="mt-1 text-xl font-black text-white">みんなの空気感</h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white">{total}人</p>
          <p className="text-xs font-bold text-slate-400">何度でも変更可</p>
        </div>
      </div>

      <div className="grid grid-cols-11 items-end gap-1.5 sm:gap-2" aria-label="視聴者分布">
        {buckets.map((bucket, index) => {
          const count = counts[index];
          const height = 18 + (count / maxCount) * 108;
          const isMiddle = bucket === 50;

          return (
            <div key={bucket} className="grid min-w-0 gap-2">
              <div className="flex h-36 items-end justify-center rounded-b-full">
                <div
                  className={cn(
                    "w-full max-w-8 rounded-full border transition-all duration-300",
                    count
                      ? "border-white/25 shadow-[0_0_22px_rgba(143,124,255,0.18)]"
                      : "border-white/10 bg-white/[0.04]",
                    isMiddle ? "opacity-100" : "opacity-90",
                  )}
                  style={{
                    height,
                    background: count
                      ? `linear-gradient(180deg, ${appConfig.colors.right}, ${appConfig.colors.middle} 48%, ${appConfig.colors.left})`
                      : undefined,
                    filter: count ? "saturate(1.08)" : undefined,
                  }}
                  title={`${bucket}: ${count}人`}
                />
              </div>
              <p className="text-center text-[11px] font-black text-slate-400">
                {bucket}
              </p>
              <p className="text-center text-xs font-black text-white">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-slate-500">
            ふんわり平均
          </p>
          <p className="mt-1 text-2xl font-black text-white">
            {formatSoftAverage(votes)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold tracking-[0.16em] text-slate-500">
            いまの見え方
          </p>
          <p className="mt-1 font-black text-cyan-100">{formatAudienceMood(votes)}</p>
        </div>
      </div>
    </section>
  );
}
