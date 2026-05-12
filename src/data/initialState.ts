import { appConfig } from "@/config/app";
import type { MeetingState } from "@/types/meeting";

const sampleAudienceVotes = [
  { id: "sample-01", name: "まんなか派", value: 50 },
  { id: "sample-02", name: "少し許せる", value: 70 },
  { id: "sample-03", name: "今日は厳しめ", value: 20 },
  { id: "sample-04", name: "聞き方による", value: 50 },
  { id: "sample-05", name: "寝たら許す", value: 80 },
  { id: "sample-06", name: "内容しだい", value: 40 },
  { id: "sample-07", name: "だいぶ無理", value: 10 },
  { id: "sample-08", name: "話してから", value: 60 },
  { id: "sample-09", name: "まあ許す", value: 90 },
  { id: "sample-10", name: "保留", value: 50 },
  { id: "sample-11", name: "ちょい右", value: 70 },
  { id: "sample-12", name: "かなり左", value: 0 },
  { id: "sample-13", name: "空気を読む", value: 60 },
  { id: "sample-14", name: "やさしめ", value: 80 },
];

const fixedSpeakerIds = [
  "00000000-0000-4000-8000-000000000001",
  "00000000-0000-4000-8000-000000000002",
  "00000000-0000-4000-8000-000000000003",
  "00000000-0000-4000-8000-000000000004",
  "00000000-0000-4000-8000-000000000005",
];

function createUuid() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function createSpeakers(useFixedIds: boolean) {
  return Array.from({ length: appConfig.maxSpeakers }, (_, index) => {
    const speakerNumber = index + 1;

    return {
      id: useFixedIds ? fixedSpeakerIds[index] : createUuid(),
      name: `スピーカー${speakerNumber}`,
      initial: String(speakerNumber),
      value: 50,
      color: appConfig.speakerPalette[index % appConfig.speakerPalette.length],
    };
  });
}

export function createInitialMeetingStateForRoom(
  roomId: string,
  options: { includeSampleAudienceVotes?: boolean; expiresAt?: string | null } = {},
): MeetingState {
  const useFixedSpeakerIds = roomId === appConfig.defaultRoomId;
  const speakers = createSpeakers(useFixedSpeakerIds);

  return {
    roomId,
    expiresAt: options.expiresAt ?? null,
    topic: "酔って失言した人を許せる？",
    leftLabel: "許せない",
    rightLabel: "許せる",
    activeSpeakerId: speakers[0]?.id ?? "",
    speakers,
    currentRole: "speaker",
    soundEnabled: appConfig.sound.enabledByDefault,
    audienceVotes: options.includeSampleAudienceVotes
      ? sampleAudienceVotes.map((vote) => ({ ...vote }))
      : [],
  };
}

export const initialMeetingState: MeetingState = {
  roomId: appConfig.defaultRoomId,
  expiresAt: null,
  topic: "酔って失言した人を許せる？",
  leftLabel: "許せない",
  rightLabel: "許せる",
  activeSpeakerId: "00000000-0000-4000-8000-000000000001",
  speakers: createSpeakers(true),
  currentRole: "speaker",
  soundEnabled: appConfig.sound.enabledByDefault,
  audienceVotes: sampleAudienceVotes,
};
