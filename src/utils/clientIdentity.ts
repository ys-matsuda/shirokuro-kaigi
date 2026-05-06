export function getOrCreateClientId(namespace: string) {
  const storageKey = `consensus-meter:${namespace}-client-id`;

  try {
    const storedId = window.localStorage.getItem(storageKey);
    if (storedId) return storedId;

    const nextId =
      typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${namespace}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(storageKey, nextId);
    return nextId;
  } catch {
    return `${namespace}-${Date.now()}`;
  }
}
