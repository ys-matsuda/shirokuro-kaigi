type TopicCardProps = {
  topic: string;
  leftLabel: string;
  rightLabel: string;
};

export function TopicCard({ topic, leftLabel, rightLabel }: TopicCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-panel backdrop-blur-xl sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3 text-xs font-bold tracking-[0.22em] text-slate-300">
        <span>現在のお題</span>
        <span>0から100までの揺れ</span>
      </div>

      <p className="max-w-5xl text-balance text-3xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
        {topic}
      </p>

      <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-left">
          <p className="text-xs font-bold text-cyan-100/70">LEFT</p>
          <p className="mt-1 text-lg font-black text-cyan-50">{leftLabel}</p>
        </div>
        <div className="grid size-14 place-items-center rounded-full border border-white/[0.15] bg-slate-950/70 text-sm font-black text-slate-200">
          50
        </div>
        <div className="rounded-lg border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-right">
          <p className="text-xs font-bold text-rose-100/70">RIGHT</p>
          <p className="mt-1 text-lg font-black text-rose-50">{rightLabel}</p>
        </div>
      </div>
    </section>
  );
}
