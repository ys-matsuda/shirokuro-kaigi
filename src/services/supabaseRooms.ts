import type { SupabaseClient } from "@supabase/supabase-js";

import { appConfig } from "@/config/app";
import { createInitialMeetingStateForRoom } from "@/data/initialState";
import type { MeetingState, SpeakerMeterParticipant } from "@/types/meeting";

export type CreatedMeetingRoom = {
  roomId: string;
  entrancePath: string;
  expiresAt: string;
};

function createRoomId() {
  const randomPart =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);

  return `room-${Date.now().toString(36)}-${randomPart}`;
}

function speakerRowsFromState(roomId: string, speakers: SpeakerMeterParticipant[]) {
  return speakers.map((speaker, index) => ({
    id: speaker.id,
    room_id: roomId,
    name: speaker.name,
    initial: speaker.initial,
    value: speaker.value,
    color: speaker.color,
    display_order: index + 1,
    is_visible: true,
    avatar_url: speaker.avatarUrl ?? null,
  }));
}

function isMissingExpiresColumnError(error: { message?: string; details?: string }) {
  const text = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return text.includes("expires_at");
}

async function insertRoom(
  supabase: SupabaseClient,
  state: MeetingState,
  expiresAt: string,
) {
  const roomPayload = {
    id: state.roomId,
    name: appConfig.name,
    topic: state.topic,
    left_label: state.leftLabel,
    right_label: state.rightLabel,
    active_speaker_id: state.activeSpeakerId || null,
  };

  const resultWithExpiry = await supabase
    .from("rooms")
    .insert({ ...roomPayload, expires_at: expiresAt });

  if (!resultWithExpiry.error) return;

  if (!isMissingExpiresColumnError(resultWithExpiry.error)) {
    throw resultWithExpiry.error;
  }

  const resultWithoutExpiry = await supabase.from("rooms").insert(roomPayload);
  if (resultWithoutExpiry.error) throw resultWithoutExpiry.error;
}

async function deleteExpiredRooms(supabase: SupabaseClient) {
  const { error } = await supabase
    .from("rooms")
    .delete()
    .not("expires_at", "is", null)
    .lt("expires_at", new Date().toISOString());

  if (error && !isMissingExpiresColumnError(error)) return;
}

export async function createMeetingRoomInSupabase(
  supabase: SupabaseClient,
): Promise<CreatedMeetingRoom> {
  const expiresAt = new Date(
    Date.now() + appConfig.roomLifetimeHours * 60 * 60 * 1000,
  ).toISOString();

  await deleteExpiredRooms(supabase);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const roomId = createRoomId();
    const state = createInitialMeetingStateForRoom(roomId, {
      expiresAt,
      includeSampleAudienceVotes: false,
    });

    try {
      await insertRoom(supabase, state, expiresAt);

      const { error: speakersError } = await supabase
        .from("speakers")
        .insert(speakerRowsFromState(roomId, state.speakers));

      if (speakersError) throw speakersError;

      return {
        roomId,
        entrancePath: `/room/${roomId}`,
        expiresAt,
      };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("ルームIDの作成に失敗しました。もう一度お試しください。");
}
