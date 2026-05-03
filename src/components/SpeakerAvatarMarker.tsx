import { cn } from "@/utils/classNames";
import type { MeterPoint } from "@/utils/meterMath";

type SpeakerAvatarMarkerProps = {
  point: MeterPoint;
  viewBoxWidth: number;
  viewBoxHeight: number;
  value: number;
  initial: string;
  name: string;
  color: string;
  isActive: boolean;
  large?: boolean;
  onSelect: () => void;
  avatarUrl?: string;
  animationMs: number;
};

export function SpeakerAvatarMarker({
  point,
  viewBoxWidth,
  viewBoxHeight,
  value,
  initial,
  name,
  color,
  isActive,
  large = false,
  onSelect,
  avatarUrl,
  animationMs,
}: SpeakerAvatarMarkerProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "absolute z-20 grid place-items-center rounded-full border bg-slate-950 transition-transform hover:scale-105",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
        large && isActive
          ? "size-[var(--stage-avatar-active)] border-white shadow-[0_18px_55px_rgba(0,0,0,0.44),0_0_38px_rgba(255,255,255,0.3)]"
          : large
            ? "size-[var(--stage-avatar)] border-white/[0.32] opacity-95 shadow-[0_14px_40px_rgba(0,0,0,0.4)]"
            : isActive
              ? "size-16 border-white shadow-[0_16px_45px_rgba(0,0,0,0.42),0_0_32px_rgba(255,255,255,0.28)] sm:size-20"
              : "size-12 border-white/[0.28] opacity-90 shadow-[0_12px_34px_rgba(0,0,0,0.38)] sm:size-14",
      )}
      style={{
        left: `${(point.x / viewBoxWidth) * 100}%`,
        top: `${(point.y / viewBoxHeight) * 100}%`,
        transform: "translate(-50%, -50%)",
        transition: `left ${animationMs}ms cubic-bezier(0.2, 0.9, 0.2, 1), top ${animationMs}ms cubic-bezier(0.2, 0.9, 0.2, 1)`,
      }}
      aria-label={`${name}のスピーカー位置 ${value}`}
      title={`${name}: ${value}`}
    >
      <div
        className={cn(
          "grid size-[calc(100%-10px)] place-items-center overflow-hidden rounded-full",
        )}
        style={{
          background: `linear-gradient(145deg, ${color}, #ffffff 115%)`,
          boxShadow: isActive ? `0 0 24px ${color}66` : undefined,
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="size-full object-cover" />
        ) : (
          <span
            className={cn(
              "font-black text-slate-950",
              large
                ? "text-[var(--stage-avatar-text)]"
                : "text-base sm:text-xl",
            )}
          >
            {initial}
          </span>
        )}
      </div>
      <span
        className={cn(
          "absolute rounded-full border border-white/10 bg-slate-950/90 px-2 py-0.5 font-black text-white shadow-lg",
          large
            ? "-bottom-[var(--stage-avatar-badge-offset)] text-[var(--stage-avatar-badge)]"
            : "-bottom-6 text-[10px]",
        )}
      >
        {value}
      </span>
    </button>
  );
}
