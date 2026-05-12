import type { SupabaseClient } from "@supabase/supabase-js";

import { appConfig } from "@/config/app";
import { createInitialMeetingStateForRoom } from "@/data/initialState";
import type {
  AudienceVoteRow,
  MeetingStateRows,
  RoomRow,
  SpeakerRow,
} from "@/types/database";
import type { MeetingState, SpeakerMeterParticipant } from "@/types/meeting";
import { meetingStateFromRows } from "@/utils/meetingStateDatabase";

function roomNameFor(roomId: string) {
  return (
    appConfig.rooms.find((room) => room.id === roomId)?.name ??
    appConfig.name
  );
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

function voteRowsFromState(roomId: string, votes: MeetingState["audienceVotes"]) {
  return votes.map((vote) => ({
    room_id: roomId,
    voter_id: vote.id,
    name: vote.name,
    value: vote.value,
  }));
}

export async function fetchMeetingStateFromSupabase(
  supabase: SupabaseClient,
  roomId: string,
) {
  const [roomResult, speakersResult, votesResult] = await Promise.all([
    supabase.from("rooms").select("*").eq("id", roomId).maybeSingle<RoomRow>(),
    supabase
      .from("speakers")
      .select("*")
      .eq("room_id", roomId)
      .order("display_order", { ascending: true })
      .returns<SpeakerRow[]>(),
    supabase
      .from("audience_votes")
      .select("*")
      .eq("room_id", roomId)
      .returns<AudienceVoteRow[]>(),
  ]);

  if (roomResult.error) throw roomResult.error;
  if (speakersResult.error) throw speakersResult.error;
  if (votesResult.error) throw votesResult.error;

  if (!roomResult.data) {
    return createInitialMeetingStateForRoom(roomId, {
      includeSampleAudienceVotes: roomId === appConfig.defaultRoomId,
    });
  }

  const rows: MeetingStateRows = {
    room: roomResult.data,
    speakers: speakersResult.data ?? [],
    audienceVotes: votesResult.data ?? [],
  };

  return meetingStateFromRows(rows);
}

export async function persistMeetingStateToSupabase(
  supabase: SupabaseClient,
  previousState: MeetingState | null,
  nextState: MeetingState,
) {
  const roomId = nextState.roomId;
  const roomChanged =
    !previousState ||
    previousState.topic !== nextState.topic ||
    previousState.leftLabel !== nextState.leftLabel ||
    previousState.rightLabel !== nextState.rightLabel ||
    previousState.activeSpeakerId !== nextState.activeSpeakerId;

  if (roomChanged) {
    const { error } = await supabase.from("rooms").upsert({
      id: roomId,
      name: roomNameFor(roomId),
      topic: nextState.topic,
      left_label: nextState.leftLabel,
      right_label: nextState.rightLabel,
      active_speaker_id: nextState.activeSpeakerId || null,
    });

    if (error) throw error;
  }

  const previousSpeakerIds = new Set(
    previousState?.speakers.map((speaker) => speaker.id) ?? [],
  );
  const nextSpeakerIds = new Set(nextState.speakers.map((speaker) => speaker.id));
  const removedSpeakerIds = [...previousSpeakerIds].filter(
    (speakerId) => !nextSpeakerIds.has(speakerId),
  );

  if (removedSpeakerIds.length > 0) {
    const { error } = await supabase
      .from("speakers")
      .delete()
      .eq("room_id", roomId)
      .in("id", removedSpeakerIds);

    if (error) throw error;
  }

  if (nextState.speakers.length > 0) {
    const { error } = await supabase
      .from("speakers")
      .upsert(speakerRowsFromState(roomId, nextState.speakers));

    if (error) throw error;
  }

  if (previousState?.audienceVotes.length && nextState.audienceVotes.length === 0) {
    const { error } = await supabase
      .from("audience_votes")
      .delete()
      .eq("room_id", roomId);

    if (error) throw error;
  }

  if (nextState.audienceVotes.length > 0) {
    const { error } = await supabase
      .from("audience_votes")
      .upsert(voteRowsFromState(roomId, nextState.audienceVotes), {
        onConflict: "room_id,voter_id",
      });

    if (error) throw error;
  }
}
