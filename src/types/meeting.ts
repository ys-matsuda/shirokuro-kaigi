export type Role = "host" | "speaker" | "audience";

export type AudienceVote = {
  id: string;
  name: string;
  value: number;
};

export type SpeakerMeterParticipant = {
  id: string;
  name: string;
  initial: string;
  value: number;
  color: string;
  avatarUrl?: string;
};

export type MeetingState = {
  topic: string;
  leftLabel: string;
  rightLabel: string;
  speakers: SpeakerMeterParticipant[];
  activeSpeakerId: string;
  audienceVotes: AudienceVote[];
  currentRole: Role;
  soundEnabled: boolean;
};
