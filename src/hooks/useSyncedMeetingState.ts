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

const legacyStorageKey = "consensus-meter:meeting-state:v3";
const roomStorageKeyPrefix = "consensus-meter:meeting-state:v4";
const roles: Role[] = ["host", "speaker", "audience"];

function getRoomStorageKey(roomId: string) {
  return `${roomStorageKeyPrefix}:${roomId}`;
}

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

function normalizeMeetingState(
  value: unknown,
  roomId: string = appConfig.defaultRoomId,
): MeetingState {
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
    roomId: typeof source.roomId === "string" ? source.roomId : roomId,
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

function readStoredMeetingState(roomId: string) {
  try {
    const roomStorageKey = getRoomStorageKey(roomId);
    const rawValue =
      window.localStorage.getItem(roomStorageKey) ??
      (roomId === appConfig.defaultRoomId
        ? window.localStorage.getItem(legacyStorageKey)
        : null);

    return rawValue
      ? normalizeMeetingState(JSON.parse(rawValue), roomId)
      : { ...initialMeetingState, roomId };
  } catch {
    return { ...initialMeetingState, roomId };
  }
}

function writeStoredMeetingState(roomId: string, state: MeetingState) {
  try {
    window.localStorage.setItem(
      getRoomStorageKey(roomId),
      JSON.stringify({ ...state, roomId }),
    );
  } catch {
    // The prototype still works if browser storage is unavailable.
  }
}

export function useSyncedMeetingState(
  roomId: string = appConfig.defaultRoomId,
): [MeetingState, Dispatch<SetStateAction<MeetingState>>] {
  const [meetingState, setMeetingState] = useState<MeetingState>(initialMeetingState);
  const [loadedRoomId, setLoadedRoomId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMeetingState(readStoredMeetingState(roomId));
      setLoadedRoomId(roomId);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [roomId]);

  useEffect(() => {
    if (loadedRoomId !== roomId) return;
    writeStoredMeetingState(roomId, meetingState);
  }, [loadedRoomId, meetingState, roomId]);

  useEffect(() => {
    const roomStorageKey = getRoomStorageKey(roomId);

    function handleStorage(event: StorageEvent) {
      if (event.key !== roomStorageKey || event.newValue === null) return;

      try {
        setMeetingState(normalizeMeetingState(JSON.parse(event.newValue), roomId));
      } catch {
        setMeetingState({ ...initialMeetingState, roomId });
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [roomId]);

  return [meetingState, setMeetingState];
}
