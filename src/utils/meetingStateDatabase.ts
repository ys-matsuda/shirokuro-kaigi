import type { MeetingState } from "@/types/meeting";
import type { MeetingStateRows } from "@/types/database";

export function meetingStateFromRows({
  room,
  speakers,
  audienceVotes,
}: MeetingStateRows): MeetingState {
  const visibleSpeakers = speakers
    .filter((speaker) => speaker.is_visible)
    .sort((first, second) => first.display_order - second.display_order)
    .map((speaker) => ({
      id: speaker.id,
      name: speaker.name,
      initial: speaker.initial,
      value: speaker.value,
      color: speaker.color,
      avatarUrl: speaker.avatar_url ?? undefined,
    }));

  return {
    roomId: room.id,
    topic: room.topic,
    leftLabel: room.left_label,
    rightLabel: room.right_label,
    activeSpeakerId:
      room.active_speaker_id &&
      visibleSpeakers.some((speaker) => speaker.id === room.active_speaker_id)
        ? room.active_speaker_id
        : visibleSpeakers[0]?.id ?? "",
    speakers: visibleSpeakers,
    audienceVotes: audienceVotes.map((vote) => ({
      id: vote.voter_id,
      name: vote.name,
      value: vote.value,
    })),
    currentRole: "speaker",
    soundEnabled: true,
  };
}
