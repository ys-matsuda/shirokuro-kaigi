export type RoomRow = {
  id: string;
  name: string;
  topic: string;
  left_label: string;
  right_label: string;
  active_speaker_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SpeakerRow = {
  id: string;
  room_id: string;
  name: string;
  initial: string;
  value: number;
  color: string;
  display_order: number;
  is_visible: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type AudienceVoteRow = {
  id: string;
  room_id: string;
  voter_id: string;
  name: string;
  value: number;
  created_at: string;
  updated_at: string;
};

export type MeetingStateRows = {
  room: RoomRow;
  speakers: SpeakerRow[];
  audienceVotes: AudienceVoteRow[];
};
