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
import {
  createInitialMeetingStateForRoom,
  initialMeetingState,
} from "@/data/initialState";
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
  const defaultState = createInitialMeetingStateForRoom(roomId, {
    includeSampleAudienceVotes: roomId === appConfig.defaultRoomId,
  });
  const speakers = Array.isArray(source.speakers)
    ? source.speakers.filter(isSpeaker).slice(0, appConfig.maxSpeakers)
    : defaultState.speakers;
  const activeSpeakerId =
    typeof source.activeSpeakerId === "string" &&
    speakers.some((speaker) => speaker.id === source.activeSpeakerId)
      ? source.activeSpeakerId
      : speakers[0]?.id ?? defaultState.activeSpeakerId;

  return {
    roomId: typeof source.roomId === "string" ? source.roomId : roomId,
    expiresAt:
      typeof source.expiresAt === "string" || source.expiresAt === null
        ? source.expiresAt
        : undefined,
    topic:
      typeof source.topic === "string"
        ? source.topic
        : defaultState.topic,
    leftLabel:
      typeof source.leftLabel === "string"
        ? source.leftLabel
        : defaultState.leftLabel,
    rightLabel:
      typeof source.rightLabel === "string"
        ? source.rightLabel
        : defaultState.rightLabel,
    speakers,
    activeSpeakerId,
    audienceVotes: Array.isArray(source.audienceVotes)
      ? source.audienceVotes.filter(isAudienceVote)
      : defaultState.audienceVotes,
    currentRole:
      typeof source.currentRole === "string" &&
      roles.includes(source.currentRole as Role)
        ? (source.currentRole as Role)
        : defaultState.currentRole,
    soundEnabled:
      typeof source.soundEnabled === "boolean"
        ? source.soundEnabled
        : defaultState.soundEnabled,
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
      : createInitialMeetingStateForRoom(roomId, {
          includeSampleAudienceVotes: roomId === appConfig.defaultRoomId,
        });
  } catch {
    return createInitialMeetingStateForRoom(roomId, {
      includeSampleAudienceVotes: roomId === appConfig.defaultRoomId,
    });
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

function mergeRemoteMeetingState(
  remoteState: MeetingState,
  currentState: MeetingState,
) {
  return {
    ...remoteState,
    currentRole: currentState.currentRole,
    soundEnabled: currentState.soundEnabled,
  };
}

function sharedMeetingStateSnapshot(state: MeetingState) {
  return JSON.stringify({
    roomId: state.roomId,
    expiresAt: state.expiresAt,
    topic: state.topic,
    leftLabel: state.leftLabel,
    rightLabel: state.rightLabel,
    speakers: state.speakers,
    activeSpeakerId: state.activeSpeakerId,
    audienceVotes: state.audienceVotes,
  });
}

export function useSyncedMeetingState(
  roomId: string = appConfig.defaultRoomId,
): [MeetingState, Dispatch<SetStateAction<MeetingState>>] {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [meetingState, setMeetingState] = useState<MeetingState>(initialMeetingState);
  const [loadedRoomId, setLoadedRoomId] = useState<string | null>(null);
  const previousPersistedStateRef = useRef<MeetingState | null>(null);
  const pendingPersistRef = useRef<MeetingState | null>(null);
  const activePersistCountRef = useRef(0);
  const lastLocalChangeAtRef = useRef(0);

  const applyRemoteState = useCallback((remoteState: MeetingState) => {
    setMeetingState((currentState) => {
      const mergedState = mergeRemoteMeetingState(remoteState, currentState);

      return sharedMeetingStateSnapshot(mergedState) ===
        sharedMeetingStateSnapshot(currentState)
        ? currentState
        : mergedState;
    });
    previousPersistedStateRef.current = remoteState;
  }, []);

  const shouldDeferRemoteRefresh = useCallback(() => {
    return (
      pendingPersistRef.current !== null ||
      activePersistCountRef.current > 0 ||
      Date.now() - lastLocalChangeAtRef.current < appConfig.sync.localEditQuietMs
    );
  }, []);

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

          applyRemoteState(remoteState);
        })
        .catch((error: unknown) => {
          console.warn("Supabase state load failed. Using local state.", error);
        });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [applyRemoteState, roomId, supabase]);

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
        setMeetingState(
          createInitialMeetingStateForRoom(roomId, {
            includeSampleAudienceVotes: roomId === appConfig.defaultRoomId,
          }),
        );
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
        if (shouldDeferRemoteRefresh()) return;

        fetchMeetingStateFromSupabase(client, roomId)
          .then((remoteState) => {
            applyRemoteState(remoteState);
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
  }, [applyRemoteState, roomId, shouldDeferRemoteRefresh, supabase]);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let isActive = true;

    const intervalId = window.setInterval(() => {
      if (shouldDeferRemoteRefresh()) return;

      fetchMeetingStateFromSupabase(client, roomId)
        .then((remoteState) => {
          if (!isActive) return;
          applyRemoteState(remoteState);
        })
        .catch((error: unknown) => {
          console.warn("Supabase fallback refresh failed.", error);
        });
    }, appConfig.sync.fallbackRefreshIntervalMs);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [applyRemoteState, roomId, shouldDeferRemoteRefresh, supabase]);

  useEffect(() => {
    if (!supabase || pendingPersistRef.current !== meetingState) return;
    const client = supabase;

    pendingPersistRef.current = null;
    activePersistCountRef.current += 1;
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
      })
      .finally(() => {
        activePersistCountRef.current = Math.max(
          0,
          activePersistCountRef.current - 1,
        );
      });
  }, [meetingState, supabase]);

  const setSyncedMeetingState = useCallback<Dispatch<SetStateAction<MeetingState>>>(
    (action) => {
      setMeetingState((currentState) => {
        const nextState =
          typeof action === "function" ? action(currentState) : action;
        const stateWithRoom = { ...nextState, roomId };
        lastLocalChangeAtRef.current = Date.now();
        pendingPersistRef.current = stateWithRoom;

        return stateWithRoom;
      });
    },
    [roomId],
  );

  return [meetingState, setSyncedMeetingState];
}
