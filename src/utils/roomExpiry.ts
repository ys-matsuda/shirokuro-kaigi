export function isRoomExpired(expiresAt?: string | null) {
  if (!expiresAt) return false;

  const expiresAtTime = Date.parse(expiresAt);
  return Number.isFinite(expiresAtTime) && expiresAtTime <= Date.now();
}
