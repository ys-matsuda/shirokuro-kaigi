"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { appConfig } from "@/config/app";
import { initialMeetingState } from "@/data/initialState";
import type {
  AudienceVote,
  MeetingState,
  Role,
  SpeakerMeterParticipant,
} from "@/types/meeting";

const storageKey = "consensus-meter:meeting-state:v2";
const roles: Role[] = ["host", "speaker", "audience"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAudienceVote(value: unknown): value is AudienceVote {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.value === "number"
  );
}

function isSpeaker(value: unknown): value is SpeakerMeterParticipant {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.initial === "string" &&
    typeof value.value === "number" &&
    typeof value.color === "string" &&
    (typeof value.avatarUrl === "undefined" || typeof value.avatarUrl === "string")
  );
}

function normalizeMeetingState(value: unknown): MeetingState {
  const source = isRecord(value) ? value : {};
  const speakers = Array.isArray(source.speakers)
    ? source.speakers.filter(isSpeaker).slice(0, appConfig.maxSpeakers)
    : initialMeetingState.speakers;
  const activeSpeakerId =
    typeof source.activeSpeakerId === "string" &&
    speakers.some((speaker) => speaker.id === source.activeSpeakerId)
      ? source.activeSpeakerId
      : speakers[0]?.id ?? initialMeetingState.activeSpeakerId;

  return {
    topic:
      typeof source.topic === "string"
        ? source.topic
        : initialMeetingState.topic,
    leftLabel:
      typeof source.leftLabel === "string"
        ? source.leftLabel
        : initialMeetingState.leftLabel,
    rightLabel:
      typeof source.rightLabel === "string"
        ? source.rightLabel
        : initialMeetingState.rightLabel,
    speakers,
    activeSpeakerId,
    audienceVotes: Array.isArray(source.audienceVotes)
      ? source.audienceVotes.filter(isAudienceVote)
      : initialMeetingState.audienceVotes,
    currentRole:
      typeof source.currentRole === "string" &&
      roles.includes(source.currentRole as Role)
        ? (source.currentRole as Role)
        : initialMeetingState.currentRole,
    soundEnabled:
      typeof source.soundEnabled === "boolean"
        ? source.soundEnabled
        : initialMeetingState.soundEnabled,
  };
}

function readStoredMeetingState() {
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    return rawValue ? normalizeMeetingState(JSON.parse(rawValue)) : initialMeetingState;
  } catch {
    return initialMeetingState;
  }
}

function writeStoredMeetingState(state: MeetingState) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // The prototype still works if browser storage is unavailable.
  }
}

export function useSyncedMeetingState(): [
  MeetingState,
  Dispatch<SetStateAction<MeetingState>>,
] {
  const [meetingState, setMeetingState] = useState<MeetingState>(initialMeetingState);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMeetingState(readStoredMeetingState());
      setHasLoadedStorage(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    writeStoredMeetingState(meetingState);
  }, [hasLoadedStorage, meetingState]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== storageKey || event.newValue === null) return;

      try {
        setMeetingState(normalizeMeetingState(JSON.parse(event.newValue)));
      } catch {
        setMeetingState(initialMeetingState);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return [meetingState, setMeetingState];
}
