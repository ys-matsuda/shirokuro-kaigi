"use client";

import { FormEvent, useState } from "react";
import { Minus, Plus, RotateCcw, Save, UsersRound } from "lucide-react";

import { appConfig } from "@/config/app";
import type { SpeakerMeterParticipant } from "@/types/meeting";
import { cn } from "@/utils/classNames";

type HostControlsProps = {
  topic: string;
  leftLabel: string;
  rightLabel: string;
  speakers: SpeakerMeterParticipant[];
  disabled?: boolean;
  disabledReason?: string;
  onUpdateTopic: (next: {
    topic: string;
    leftLabel: string;
    rightLabel: string;
  }) => void;
  onSpeakersChange: (speakers: SpeakerMeterParticipant[]) => void;
  onActiveSpeakerChange: (speakerId: string) => void;
  onResetSpeaker: () => void;
  onResetAudience: () => void;
  onResetSpeakers: () => void;
};

function createSpeakerId() {
  if (typeof window !== "undefined" && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `00000000-0000-4000-8000-${Date.now().toString().slice(-12)}`;
}

export function HostControls({
  topic,
  leftLabel,
  rightLabel,
  speakers,
  disabled = false,
  disabledReason,
  onUpdateTopic,
  onSpeakersChange,
  onActiveSpeakerChange,
  onResetSpeaker,
  onResetAudience,
  onResetSpeakers,
}: HostControlsProps) {
  const [draftTopic, setDraftTopic] = useState(topic);
  const [draftLeftLabel, setDraftLeftLabel] = useState(leftLabel);
  const [draftRightLabel, setDraftRightLabel] = useState(rightLabel);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    onUpdateTopic({
      topic: draftTopic.trim() || topic,
      leftLabel: draftLeftLabel.trim() || leftLabel,
      rightLabel: draftRightLabel.trim() || rightLabel,
    });
  }

  function updateSpeaker(
    speakerId: string,
    patch: Partial<Pick<SpeakerMeterParticipant, "name" | "initial">>,
  ) {
    if (disabled) return;

    onSpeakersChange(
      speakers.map((speaker) => {
        if (speaker.id !== speakerId) return speaker;

        const nextName = patch.name ?? speaker.name;
        const fallbackInitial = nextName.trim().slice(0, 1) || speaker.initial;

        return {
          ...speaker,
          ...patch,
          name: nextName,
          initial: patch.initial ?? fallbackInitial,
        };
      }),
    );
  }

  function addSpeaker() {
    if (disabled || speakers.length >= appConfig.maxSpeakers) return;

    const usedNames = new Set(speakers.map((speaker) => speaker.name.trim()));
    let nextIndex = speakers.length + 1;

    while (usedNames.has(`スピーカー${nextIndex}`)) {
      nextIndex += 1;
    }

    const newSpeaker: SpeakerMeterParticipant = {
      id: createSpeakerId(),
      name: `スピーカー${nextIndex}`,
      initial: String(nextIndex),
      value: 50,
      color: appConfig.speakerPalette[speakers.length % appConfig.speakerPalette.length],
    };

    onSpeakersChange([...speakers, newSpeaker]);
    onActiveSpeakerChange(newSpeaker.id);
  }

  function removeSpeaker(speakerId: string) {
    if (disabled || speakers.length <= 1) return;

    const nextSpeakers = speakers.filter((speaker) => speaker.id !== speakerId);
    onSpeakersChange(nextSpeakers);
    onActiveSpeakerChange(nextSpeakers[0].id);
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-panel backdrop-blur-xl">
      <div className="mb-4">
        <p className="text-xs font-bold tracking-[0.22em] text-amber-100/60">
          HOST
        </p>
        <h2 className="mt-1 text-xl font-black text-white">ホスト操作</h2>
        {disabledReason ? (
          <p className="mt-2 text-sm font-bold text-amber-100/70">{disabledReason}</p>
        ) : null}
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <fieldset
          disabled={disabled}
          className="grid gap-4 disabled:cursor-not-allowed disabled:opacity-55"
        >
          <label className="grid gap-2 text-sm font-bold text-slate-300">
          お題
          <textarea
            value={draftTopic}
            onChange={(event) => setDraftTopic(event.target.value)}
            rows={3}
            maxLength={120}
            className="min-h-24 resize-none rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-base font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200/50"
          />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-300">
            左ラベル
            <input
              value={draftLeftLabel}
              onChange={(event) => setDraftLeftLabel(event.target.value)}
              maxLength={28}
              className="min-h-12 rounded-lg border border-white/10 bg-slate-950/70 px-4 text-base font-bold text-white outline-none transition focus:border-cyan-200/50"
            />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-300">
            右ラベル
            <input
              value={draftRightLabel}
              onChange={(event) => setDraftRightLabel(event.target.value)}
              maxLength={28}
              className="min-h-12 rounded-lg border border-white/10 bg-slate-950/70 px-4 text-base font-bold text-white outline-none transition focus:border-rose-200/50"
            />
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 text-base font-black text-slate-950 transition hover:bg-cyan-50 disabled:cursor-not-allowed"
          >
            <Save aria-hidden="true" className="size-4" />
            お題を反映
          </button>
        </fieldset>
      </form>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onResetSpeaker}
          disabled={disabled}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-slate-100 transition hover:bg-white/[0.1]"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          メーターを戻す
        </button>
        <button
          type="button"
          onClick={onResetAudience}
          disabled={disabled}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-slate-100 transition hover:bg-white/[0.1]"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          投票を空にする
        </button>
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.22em] text-cyan-100/60">
              SPEAKERS
            </p>
            <h3 className="mt-1 text-lg font-black text-white">
              スピーカー管理
            </h3>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onResetSpeakers}
              disabled={disabled}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-black text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-45"
              title="スピーカー管理を初期状態に戻す"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              初期化
            </button>
            <button
              type="button"
              onClick={addSpeaker}
              disabled={disabled || speakers.length >= appConfig.maxSpeakers}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-black text-slate-100 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-45"
              title="スピーカーを追加"
            >
              <Plus aria-hidden="true" className="size-4" />
              追加
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {speakers.map((speaker, index) => (
            <div
              key={speaker.id}
              className="grid gap-2 rounded-lg border border-white/10 bg-slate-950/60 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-full text-sm font-black text-slate-950"
                    style={{ backgroundColor: speaker.color }}
                  >
                    {speaker.initial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">
                      {speaker.name}
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      {index + 1} / {appConfig.maxSpeakers}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSpeaker(speaker.id)}
                  disabled={disabled || speakers.length <= 1}
                  className={cn(
                    "grid min-h-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06] px-3 text-slate-200 transition hover:bg-white/[0.1]",
                    (disabled || speakers.length <= 1) &&
                      "cursor-not-allowed opacity-45",
                  )}
                  title="このスピーカーを外す"
                >
                  <Minus aria-hidden="true" className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-2">
                <label className="grid min-w-0 gap-1 text-xs font-bold text-slate-400">
                  表示名
                  <input
                    value={speaker.name}
                    disabled={disabled}
                    onChange={(event) =>
                      updateSpeaker(speaker.id, { name: event.target.value })
                    }
                    maxLength={18}
                    className="min-h-10 min-w-0 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm font-bold text-white outline-none transition focus:border-cyan-200/50 disabled:cursor-not-allowed"
                  />
                </label>

                <label className="grid min-w-0 gap-1 text-xs font-bold text-slate-400">
                  丸文字
                  <input
                    value={speaker.initial}
                    disabled={disabled}
                    onChange={(event) =>
                      updateSpeaker(speaker.id, {
                        initial: event.target.value.slice(0, 2),
                      })
                    }
                    maxLength={2}
                    className="min-h-10 w-full min-w-0 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-center text-sm font-black text-white outline-none transition focus:border-cyan-200/50 disabled:cursor-not-allowed"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-slate-400">
          <UsersRound aria-hidden="true" className="size-4" />
          表示されるのは現在の{speakers.length}人だけです。
        </p>
      </div>
    </section>
  );
}
