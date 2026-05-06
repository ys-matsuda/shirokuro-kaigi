"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { appConfig } from "@/config/app";
import { initialMeetingState } from "@/data/initialState";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  fetchMeetingStateFromSupabase,
  persistMeetingStateToSupabase,
} from "@/services/supabaseMeetingState";
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
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [meetingState, setMeetingState] = useState<MeetingState>(initialMeetingState);
  const [loadedRoomId, setLoadedRoomId] = useState<string | null>(null);
  const previousPersistedStateRef = useRef<MeetingState | null>(null);
  const pendingPersistRef = useRef<MeetingState | null>(null);

  useEffect(() => {
    let isActive = true;

    const timeoutId = window.setTimeout(() => {
      const localState = readStoredMeetingState(roomId);
      setMeetingState(localState);
      previousPersistedStateRef.current = localState;
      setLoadedRoomId(roomId);

      if (!supabase) return;

      fetchMeetingStateFromSupabase(supabase, roomId)
        .then((remoteState) => {
          if (!isActive) return;

          setMeetingState((currentState) => ({
            ...remoteState,
            currentRole: currentState.currentRole,
            soundEnabled: currentState.soundEnabled,
          }));
          previousPersistedStateRef.current = remoteState;
        })
        .catch((error: unknown) => {
          console.warn("Supabase state load failed. Using local state.", error);
        });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [roomId, supabase]);

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

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    let refreshTimeoutId: number | null = null;

    function scheduleRefresh() {
      if (refreshTimeoutId !== null) {
        window.clearTimeout(refreshTimeoutId);
      }

      refreshTimeoutId = window.setTimeout(() => {
        fetchMeetingStateFromSupabase(client, roomId)
          .then((remoteState) => {
            setMeetingState((currentState) => ({
              ...remoteState,
              currentRole: currentState.currentRole,
              soundEnabled: currentState.soundEnabled,
            }));
            previousPersistedStateRef.current = remoteState;
          })
          .catch((error: unknown) => {
            console.warn("Supabase realtime refresh failed.", error);
          });
      }, 80);
    }

    const channel = client
      .channel(`meeting-room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "speakers",
          filter: `room_id=eq.${roomId}`,
        },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "audience_votes",
          filter: `room_id=eq.${roomId}`,
        },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (refreshTimeoutId !== null) {
        window.clearTimeout(refreshTimeoutId);
      }

      void client.removeChannel(channel);
    };
  }, [roomId, supabase]);

  useEffect(() => {
    if (!supabase || pendingPersistRef.current !== meetingState) return;
    const client = supabase;

    pendingPersistRef.current = null;
    persistMeetingStateToSupabase(
      client,
      previousPersistedStateRef.current,
      meetingState,
    )
      .then(() => {
        previousPersistedStateRef.current = meetingState;
      })
      .catch((error: unknown) => {
        console.warn("Supabase state save failed.", error);
      });
  }, [meetingState, supabase]);

  const setSyncedMeetingState = useCallback<Dispatch<SetStateAction<MeetingState>>>(
    (action) => {
      setMeetingState((currentState) => {
        const nextState =
          typeof action === "function" ? action(currentState) : action;
        const stateWithRoom = { ...nextState, roomId };
        pendingPersistRef.current = stateWithRoom;

        return stateWithRoom;
      });
    },
    [roomId],
  );

  return [meetingState, setSyncedMeetingState];
}
