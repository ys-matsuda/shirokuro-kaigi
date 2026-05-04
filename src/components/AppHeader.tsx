"use client";

import { Radio } from "lucide-react";

import type { Role } from "@/types/meeting";

import { RoleSelector } from "./RoleSelector";

type AppHeaderProps = {
  appName: string;
  roomName: string;
  statusLabel: string;
  currentRole: Role;
  lockedRoles?: Partial<Record<Role, boolean>>;
  onRoleChange: (role: Role) => void;
};

export function AppHeader({
  appName,
  roomName,
  statusLabel,
  currentRole,
  lockedRoles,
  onRoleChange,
}: AppHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pt-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_28px_rgba(71,184,255,0.18)]">
            <Radio aria-hidden="true" className="size-5" strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.22em] text-cyan-100/70">
              {roomName}
            </p>
            <h1 className="truncate text-[0.625rem] font-black text-white sm:text-xs">
              {appName}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
          {statusLabel}
        </div>
        <RoleSelector
          currentRole={currentRole}
          lockedRoles={lockedRoles}
          onRoleChange={onRoleChange}
        />
      </div>
    </header>
  );
}
