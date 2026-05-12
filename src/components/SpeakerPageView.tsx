"use client";

import Link from "next/link";

import { appConfig } from "@/config/app";
import {
  createInitialMeetingStateForRoom,
  initialMeetingState,
} from "@/data/initialState";
import { useKeyAccess } from "@/hooks/useKeyAccess";
import { useSyncedMeetingState } from "@/hooks/useSyncedMeetingState";
import { useTickSound } from "@/hooks/useTickSound";
import type {
  AudienceVote,
  MeetingState,
  SpeakerMeterParticipant,
} from "@/types/meeting";
import { isRoomExpired } from "@/utils/roomExpiry";

import { BroadcastStage } from "./BroadcastStage";
import { HostControls } from "./HostControls";
import { KeyAccessPanel } from "./KeyAccessPanel";
import { RoomExpiredView } from "./RoomExpiredView";
import { SpeakerMultiLeverPanel } from "./SpeakerMultiLeverPanel";

type SpeakerPageViewProps = {
  roomId?: string;
  entranceHref?: string;
  audienceHref?: string;
  stageHref?: string;
};

export function SpeakerPageView({
  roomId = appConfig.defaultRoomId,
  entranceHref = "/",
  audienceHref = "/audience",
  stageHref = "/stage",
}: SpeakerPageViewProps) {
  const [meetingState, setMeetingState] = useSyncedMeetingState(roomId);
  const {
    topic,
    leftLabel,
    rightLabel,
    soundEnabled,
    speakers,
    activeSpeakerId,
    audienceVotes,
  } = meetingState;
  const {
    isUnlocked: isSpeakerUnlocked,
    unlock: unlockSpeaker,
    lock: lockSpeaker,
  } = useKeyAccess({
    accessKey: appConfig.access.speakerKey,
    defaultUnlocked: appConfig.access.speakerUnlockedByDefault,
    storageKey: "consensus-meter:speaker-access:v1",
  });
  const {
    isUnlocked: isHostUnlocked,
    unlock: unlockHost,
    lock: lockHost,
  } = useKeyAccess({
    accessKey: appConfig.access.hostKey,
    defaultUnlocked: appConfig.access.hostUnlockedByDefault,
    storageKey: "consensus-meter:host-access:v1",
  });
  const { playTickForValue, primeTickSound } = useTickSound({
    enabled: soundEnabled,
    step: appConfig.sound.tickStep,
    volume: appConfig.sound.volume,
    minIntervalMs: appConfig.sound.minIntervalMs,
  });
  const isExpired = isRoomExpired(meetingState.expiresAt);

  function updateMeetingState(updater: (currentState: MeetingState) => MeetingState) {
    setMeetingState(updater);
  }

  function setSoundEnabled(nextSoundEnabled: boolean) {
    updateMeetingState((currentState) => ({
      ...currentState,
      soundEnabled: nextSoundEnabled,
    }));
  }

  function setActiveSpeakerId(nextActiveSpeakerId: string) {
    updateMeetingState((currentState) => ({
      ...currentState,
      activeSpeakerId: nextActiveSpeakerId,
      currentRole: "speaker",
    }));
  }

  function updateSpeakerValue(speakerId: string, value: number) {
    updateMeetingState((currentState) => ({
      ...currentState,
      currentRole: "speaker",
      activeSpeakerId: speakerId,
      speakers: currentState.speakers.map((speaker) =>
        speaker.id === speakerId ? { ...speaker, value } : speaker,
      ),
    }));
  }

  function updateSpeakers(nextSpeakers: SpeakerMeterParticipant[]) {
    const safeSpeakers = nextSpeakers.slice(0, appConfig.maxSpeakers);
    updateMeetingState((currentState) => ({
      ...currentState,
      speakers: safeSpeakers,
      activeSpeakerId: safeSpeakers.some(
        (speaker) => speaker.id === currentState.activeSpeakerId,
      )
        ? currentState.activeSpeakerId
        : safeSpeakers[0]?.id ?? initialMeetingState.activeSpeakerId,
    }));
  }

  function resetAudienceVotes() {
    updateMeetingState((currentState) => ({
      ...currentState,
      audienceVotes: [] as AudienceVote[],
    }));
  }

  function resetSpeakerMeter() {
    updateMeetingState((currentState) => ({
      ...currentState,
      activeSpeakerId:
        currentState.speakers[0]?.id ?? initialMeetingState.activeSpeakerId,
      speakers: currentState.speakers.map((speaker) => ({
        ...speaker,
        value:
          initialMeetingState.speakers.find((initial) => initial.id === speaker.id)
            ?.value ?? 50,
      })),
    }));
  }

  function resetSpeakerManagement() {
    updateMeetingState((currentState) => ({
      ...currentState,
      ...createInitialMeetingStateForRoom(currentState.roomId, {
        expiresAt: currentState.expiresAt,
        includeSampleAudienceVotes: false,
      }),
      topic: currentState.topic,
      leftLabel: currentState.leftLabel,
      rightLabel: currentState.rightLabel,
      audienceVotes: currentState.audienceVotes,
      soundEnabled: currentState.soundEnabled,
    }));
  }

  if (isExpired) {
    return <RoomExpiredView />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(71,184,255,0.16),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(255,107,154,0.13),transparent_30%),linear-gradient(135deg,#070914_0%,#0d1120_44%,#160f1f_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(71,184,255,0.055),transparent_28%,rgba(255,107,154,0.055)_78%,transparent)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.22em] text-cyan-100/60">
              SPEAKER CONSOLE
            </p>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              スピーカー操作
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-black">
            <Link
              href={entranceHref}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              エントランス
            </Link>
            <Link
              href={audienceHref}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              視聴者
            </Link>
            <Link
              href={stageHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-slate-100 transition hover:border-white/20 hover:bg-white/[0.1]"
            >
              画面共有
            </Link>
          </nav>
        </header>

        <BroadcastStage
          topic={topic}
          leftLabel={leftLabel}
          rightLabel={rightLabel}
          speakers={speakers}
          activeSpeakerId={activeSpeakerId}
          audienceVotes={audienceVotes}
          onActiveSpeakerChange={setActiveSpeakerId}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]">
          <SpeakerMultiLeverPanel
            speakers={speakers}
            activeSpeakerId={activeSpeakerId}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            soundEnabled={soundEnabled}
            disabled={!isSpeakerUnlocked}
            disabledReason="スピーカーキーを入力すると操作できます。"
            onActiveSpeakerChange={setActiveSpeakerId}
            onSoundEnabledChange={setSoundEnabled}
            onSpeakerValueChange={updateSpeakerValue}
            onReset={resetSpeakerMeter}
            resetDisabled={!isHostUnlocked}
            resetDisabledReason="ホストキーを入力するとリセットできます。"
            onPrimeSound={primeTickSound}
            onTick={playTickForValue}
          />

          <div className="grid gap-5">
            <HostControls
              topic={topic}
              leftLabel={leftLabel}
              rightLabel={rightLabel}
              speakers={speakers}
              disabled={!isHostUnlocked}
              disabledReason={
                isHostUnlocked
                  ? undefined
                  : "ホストキーを入力すると、お題変更・初期化・スピーカー管理が使えます。"
              }
              onUpdateTopic={(next) => {
                updateMeetingState((currentState) => ({
                  ...currentState,
                  topic: next.topic,
                  leftLabel: next.leftLabel,
                  rightLabel: next.rightLabel,
                }));
              }}
              onSpeakersChange={updateSpeakers}
              onActiveSpeakerChange={setActiveSpeakerId}
              onResetSpeaker={resetSpeakerMeter}
              onResetAudience={resetAudienceVotes}
              onResetSpeakers={resetSpeakerManagement}
            />

            <KeyAccessPanel
              eyebrow="SPEAKER ACCESS"
              title="スピーカー権限"
              label="スピーカーキー"
              placeholder="スピーカーだけが入力"
              unlockedMessage="スピーカーレバーを操作できます。"
              lockedMessage="ロック中は、ステージ閲覧だけできます。"
              errorMessage="スピーカーキーが違います。"
              unlockButtonLabel="スピーカーとして解除"
              tone="cyan"
              isUnlocked={isSpeakerUnlocked}
              onUnlock={unlockSpeaker}
              onLock={lockSpeaker}
            />

            <KeyAccessPanel
              eyebrow="HOST ACCESS"
              title="ホスト権限"
              label="ホストキー"
              placeholder="ホストだけが入力"
              unlockedMessage="お題変更・初期化・スピーカー管理が使えます。"
              lockedMessage="ロック中は、お題変更・初期化・スピーカー管理だけ使えません。"
              errorMessage="ホストキーが違います。"
              unlockButtonLabel="ホストとして解除"
              isUnlocked={isHostUnlocked}
              onUnlock={unlockHost}
              onLock={lockHost}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
