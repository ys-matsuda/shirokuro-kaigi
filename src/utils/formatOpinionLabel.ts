import type { AudienceVote } from "@/types/meeting";

export function formatOpinionLabel(value: number) {
  if (value <= 12) return "かなり左寄り";
  if (value <= 32) return "左の気持ちが強め";
  if (value <= 44) return "少し左に揺れている";
  if (value < 56) return "真ん中付近";
  if (value < 69) return "少し右に揺れている";
  if (value < 89) return "右の気持ちが強め";
  return "かなり右寄り";
}

export function formatAudienceMood(votes: AudienceVote[]) {
  if (!votes.length) return "まだ空気を待っている";

  const total = votes.length;
  const middle = votes.filter((vote) => vote.value >= 40 && vote.value <= 60).length;
  const left = votes.filter((vote) => vote.value <= 30).length;
  const right = votes.filter((vote) => vote.value >= 70).length;
  const average = votes.reduce((sum, vote) => sum + vote.value, 0) / total;

  if (left / total > 0.28 && right / total > 0.28 && middle / total < 0.36) {
    return "左右にふわっと割れている";
  }

  if (middle / total >= 0.42) return "真ん中多め";
  if (average < 42) return "やや左寄りの空気";
  if (average > 58) return "やや右寄りの空気";
  return "ほどよく散らばっている";
}

export function formatSoftAverage(votes: AudienceVote[]) {
  if (!votes.length) return "--";

  const average = votes.reduce((sum, vote) => sum + vote.value, 0) / votes.length;
  return Math.round(average).toString();
}
