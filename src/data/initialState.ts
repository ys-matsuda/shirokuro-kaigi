import { appConfig } from "@/config/app";
import type { MeetingState } from "@/types/meeting";

export const initialMeetingState: MeetingState = {
  topic: "酔って失言した人を許せる？",
  leftLabel: "許せない",
  rightLabel: "許せる",
  activeSpeakerId: "speaker-01",
  speakers: [
    {
      id: "speaker-01",
      name: "司会",
      initial: "司",
      value: 50,
      color: appConfig.speakerPalette[0],
    },
    {
      id: "speaker-02",
      name: "左寄り",
      initial: "左",
      value: 28,
      color: appConfig.speakerPalette[1],
    },
    {
      id: "speaker-03",
      name: "真ん中",
      initial: "中",
      value: 52,
      color: appConfig.speakerPalette[2],
    },
    {
      id: "speaker-04",
      name: "右寄り",
      initial: "右",
      value: 72,
      color: appConfig.speakerPalette[3],
    },
    {
      id: "speaker-05",
      name: "迷い中",
      initial: "迷",
      value: 42,
      color: appConfig.speakerPalette[4],
    },
  ],
  currentRole: "speaker",
  soundEnabled: appConfig.sound.enabledByDefault,
  audienceVotes: [
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
  ],
};
