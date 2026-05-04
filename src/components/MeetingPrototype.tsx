"use client";

import { useMemo, useState } from "react";

import { appConfig } from "@/config/app";
import { initialMeetingState } from "@/data/initialState";
import { useTickSound } from "@/hooks/useTickSound";
import type { AudienceVote, Role, SpeakerMeterParticipant } from "@/types/meeting";

import { AccessPanel, type AccessState } from "./AccessPanel";
import { AppHeader } from "./AppHeader";
import { AudienceVotePanel } from "./AudienceVotePanel";
import { BroadcastStage } from "./BroadcastStage";
import { HostControls } from "./HostControls";
import { SpeakerControlLever } from "./SpeakerControlLever";

const localAudienceId = "local-audience";
const localAudienceName = "自分";

const roleCopy: Record<Role, string> = {
  host: "ホスト視点: お題やラベルを整えて、場の揺れを眺める準備をします。",
  speaker: "スピーカー視点: 話しながらレバーを動かして、言葉になりきらない位置を見せます。",
  audience: "視聴者視点: 10刻みで気持ちを置いて、何度でも動かせます。",
};

export function MeetingPrototype() {
  const [topic, setTopic] = useState(initialMeetingState.topic);
  const [leftLabel, setLeftLabel] = useState(initialMeetingState.leftLabel);
  const [rightLabel, setRightLabel] = useState(initialMeetingState.rightLabel);
  const [currentRole, setCurrentRole] = useState<Role>(initialMeetingState.currentRole);
  const [access, setAccess] = useState<AccessState>({
    hostUnlocked: appConfig.access.hostUnlockedByDefault,
    speakerUnlocked: appConfig.access.speakerUnlockedByDefault,
    speakerControlEnabled: appConfig.access.speakerControlEnabledByDefault,
  });
  const [soundEnabled, setSoundEnabled] = useState(initialMeetingState.soundEnabled);
  const [speakers, setSpeakers] = useState<SpeakerMeterParticipant[]>(
    initialMeetingState.speakers,
  );
  const [activeSpeakerId, setActiveSpeakerId] = useState(
    initialMeetingState.activeSpeakerId,
  );
  const [audienceVotes, setAudienceVotes] = useState<AudienceVote[]>(
    initialMeetingState.audienceVotes,
  );
  const [selectedAudienceValue, setSelectedAudienceValue] = useState<number | null>(
    null,
  );

  const { playTickForValue, primeTickSound } = useTickSound({
    enabled: soundEnabled,
    step: appConfig.sound.tickStep,
    volume: appConfig.sound.volume,
    minIntervalMs: appConfig.sound.minIntervalMs,
  });

  const votesWithLocalUser = useMemo(() => audienceVotes, [audienceVotes]);
  const activeSpeaker =
    speakers.find((speaker) => speaker.id === activeSpeakerId) ?? speakers[0];
  const activeSpeakerValue = activeSpeaker?.value ?? 50;
  const lockedRoles: Partial<Record<Role, boolean>> = {
    host: !access.hostUnlocked,
    speaker: !access.speakerUnlocked || !access.speakerControlEnabled,
  };
  const canUseHostControls = currentRole === "host" && access.hostUnlocked;
  const canUseSpeakerControls =
    currentRole === "speaker" &&
    access.speakerUnlocked &&
    access.speakerControlEnabled;
  const hostDisabledReason =
    currentRole === "host"
      ? "ホストキーが必要です"
      : "ホスト役に切り替えると操作できます";
  const speakerDisabledReason =
    currentRole !== "speaker"
      ? "スピーカー役に切り替えると操作できます"
      : !access.speakerUnlocked
        ? "スピーカーキーが必要です"
        : "スピーカー操作が一時停止中です";

  function handleAccessChange(nextAccess: AccessState) {
    setAccess(nextAccess);

    if (currentRole === "host" && !nextAccess.hostUnlocked) {
      setCurrentRole("audience");
      return;
    }

    if (
      currentRole === "speaker" &&
      (!nextAccess.speakerUnlocked || !nextAccess.speakerControlEnabled)
    ) {
      setCurrentRole("audience");
    }
  }

  function handleRoleChange(role: Role) {
    if (lockedRoles[role]) return;
    setCurrentRole(role);
  }

  function updateActiveSpeakerValue(value: number) {
    setSpeakers((currentSpeakers) =>
      currentSpeakers.map((speaker) =>
        speaker.id === activeSpeakerId ? { ...speaker, value } : speaker,
      ),
    );
  }

  function updateSpeakers(nextSpeakers: SpeakerMeterParticipant[]) {
    const safeSpeakers = nextSpeakers.slice(0, appConfig.maxSpeakers);
    setSpeakers(safeSpeakers);

    if (!safeSpeakers.some((speaker) => speaker.id === activeSpeakerId)) {
      setActiveSpeakerId(safeSpeakers[0]?.id ?? initialMeetingState.activeSpeakerId);
    }
  }

  function handleAudienceVote(value: number) {
    setSelectedAudienceValue(value);
    setAudienceVotes((votes) => {
      const nextVote = {
        id: localAudienceId,
        name: localAudienceName,
        value,
      };

      if (votes.some((vote) => vote.id === localAudienceId)) {
        return votes.map((vote) => (vote.id === localAudienceId ? nextVote : vote));
      }

      return [nextVote, ...votes];
    });
  }

  function resetAudienceVotes() {
    setSelectedAudienceValue(null);
    setAudienceVotes([]);
  }

  function resetSpeakerMeter() {
    setSpeakers((currentSpeakers) =>
      currentSpeakers.map((speaker) => ({
        ...speaker,
        value:
          initialMeetingState.speakers.find((initial) => initial.id === speaker.id)
            ?.value ?? 50,
      })),
    );
    setActiveSpeakerId(initialMeetingState.activeSpeakerId);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(71,184,255,0.16),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(255,107,154,0.13),transparent_30%),linear-gradient(135deg,#070914_0%,#0d1120_44%,#160f1f_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(71,184,255,0.055),transparent_28%,rgba(255,107,154,0.055)_78%,transparent)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10">
        <AppHeader
          appName={appConfig.name}
          roomName={appConfig.roomName}
          statusLabel={appConfig.realtimeStatusLabel}
          currentRole={currentRole}
          lockedRoles={lockedRoles}
          onRoleChange={handleRoleChange}
        />

        <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <BroadcastStage
            topic={topic}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            speakers={speakers}
            activeSpeakerId={activeSpeakerId}
            audienceVotes={votesWithLocalUser}
            onActiveSpeakerChange={setActiveSpeakerId}
          />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div className="grid content-start gap-5">
              <SpeakerControlLever
                value={activeSpeakerValue}
                speakers={speakers}
                activeSpeakerId={activeSpeakerId}
                leftLabel={leftLabel}
                rightLabel={rightLabel}
                soundEnabled={soundEnabled}
                disabled={!canUseSpeakerControls}
                disabledReason={!canUseSpeakerControls ? speakerDisabledReason : undefined}
                onActiveSpeakerChange={setActiveSpeakerId}
                onSoundEnabledChange={setSoundEnabled}
                onValueChange={updateActiveSpeakerValue}
                onReset={resetSpeakerMeter}
                onPrimeSound={primeTickSound}
                onTick={playTickForValue}
              />
            </div>

            <aside className="grid content-start gap-5">
              <section className="rounded-lg border border-white/10 bg-white/[0.065] p-4 text-sm font-bold text-slate-300 shadow-panel backdrop-blur-xl">
                <p className="text-xs font-black tracking-[0.2em] text-slate-500">
                  ROLE VIEW
                </p>
                <p className="mt-2 text-white">{roleCopy[currentRole]}</p>
              </section>

              <AccessPanel
                access={access}
                canManageAccess={canUseHostControls}
                onAccessChange={handleAccessChange}
              />

              <AudienceVotePanel
                votes={votesWithLocalUser}
                selectedValue={selectedAudienceValue}
                leftLabel={leftLabel}
                rightLabel={rightLabel}
                onVote={handleAudienceVote}
                onResetVotes={resetAudienceVotes}
              />

              <HostControls
                topic={topic}
                leftLabel={leftLabel}
                rightLabel={rightLabel}
                speakers={speakers}
                disabled={!canUseHostControls}
                disabledReason={!canUseHostControls ? hostDisabledReason : undefined}
                onUpdateTopic={(next) => {
                  setTopic(next.topic);
                  setLeftLabel(next.leftLabel);
                  setRightLabel(next.rightLabel);
                }}
                onSpeakersChange={updateSpeakers}
                onActiveSpeakerChange={setActiveSpeakerId}
                onResetSpeaker={resetSpeakerMeter}
                onResetAudience={resetAudienceVotes}
              />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
