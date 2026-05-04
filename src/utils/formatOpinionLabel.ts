import type { AudienceVote } from "@/types/meeting";

export function formatOpinionLabel(value: number) {
  if (value <= 12) return "かなり左寄り";
  if (value <= 32) return "左の気持ちが強め";
  if (value <= 44) return "少し左に揺れている";
  if (value < 56) return "保留のまんなか";
  if (value < 69) return "少し右に揺れている";
  if (value < 89) return "右の気持ちが強め";
  return "かなり右寄り";
}

export function formatSpeakerMood(
  value: number,
  leftLabel = "左",
  rightLabel = "右",
) {
  const roundedValue = Math.round(value);

  if (roundedValue === 100) return rightLabel;
  if (roundedValue >= 61) return `やや${rightLabel}寄り`;
  if (roundedValue >= 40) return "真ん中で揺れている";
  if (roundedValue > 0) return `やや${leftLabel}寄り`;
  return leftLabel;
}

export function formatAudienceMood(
  votes: AudienceVote[],
  leftLabel = "左",
  rightLabel = "右",
) {
  if (!votes.length) return "まだ空気を待っている";

  const total = votes.length;
  const average = votes.reduce((sum, vote) => sum + vote.value, 0) / total;
  const roundedAverage = Math.round(average);

  if (roundedAverage === 100) return `みんな${rightLabel}`;
  if (roundedAverage >= 61) return `やや${rightLabel}寄りの空気`;
  if (roundedAverage >= 40) return "真ん中で揺れている";
  if (roundedAverage > 0) return `やや${leftLabel}寄りの空気`;
  return `みんな${leftLabel}`;
}

export function formatSoftAverage(votes: AudienceVote[]) {
  if (!votes.length) return "--";

  const average = votes.reduce((sum, vote) => sum + vote.value, 0) / votes.length;
  return Math.round(average).toString();
}
