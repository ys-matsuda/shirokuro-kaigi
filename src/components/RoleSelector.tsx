"use client";

import { Crown, Eye, Lock, Mic2 } from "lucide-react";

import type { Role } from "@/types/meeting";
import { cn } from "@/utils/classNames";

type RoleSelectorProps = {
  currentRole: Role;
  lockedRoles?: Partial<Record<Role, boolean>>;
  onRoleChange: (role: Role) => void;
};

const roles: Array<{
  value: Role;
  label: string;
  description: string;
  Icon: typeof Crown;
}> = [
  {
    value: "host",
    label: "ホスト",
    description: "お題とリセット",
    Icon: Crown,
  },
  {
    value: "speaker",
    label: "スピーカー",
    description: "メーター操作",
    Icon: Mic2,
  },
  {
    value: "audience",
    label: "視聴者",
    description: "10刻みで参加",
    Icon: Eye,
  },
];

export function RoleSelector({
  currentRole,
  lockedRoles = {},
  onRoleChange,
}: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1 shadow-inner shadow-black/20">
      {roles.map(({ value, label, description, Icon }) => {
        const isActive = currentRole === value;
        const isLocked = lockedRoles[value] ?? false;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            aria-disabled={isLocked}
            title={description}
            onClick={() => {
              if (!isLocked) onRoleChange(value);
            }}
            className={cn(
              "group flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold text-slate-300 transition",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
              isLocked
                ? "cursor-not-allowed text-slate-500"
                : isActive
                ? "bg-white text-slate-950 shadow-lg shadow-cyan-950/30"
                : "hover:bg-white/10 hover:text-white",
            )}
          >
            {isLocked ? (
              <Lock aria-hidden="true" className="size-4 text-slate-500" />
            ) : (
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-4",
                  isActive ? "text-fuchsia-600" : "text-cyan-200",
                )}
                strokeWidth={2.4}
              />
            )}
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
