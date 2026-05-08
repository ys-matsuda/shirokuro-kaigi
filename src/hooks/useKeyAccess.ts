"use client";

import { useCallback, useEffect, useState } from "react";

type UseKeyAccessOptions = {
  accessKey: string;
  defaultUnlocked: boolean;
  storageKey: string;
};

export function useKeyAccess({
  accessKey,
  defaultUnlocked,
  storageKey,
}: UseKeyAccessOptions) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(defaultUnlocked);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      try {
        const storedValue = window.localStorage.getItem(storageKey);

        if (storedValue === "unlocked") {
          setIsUnlocked(true);
        } else if (storedValue === "locked") {
          setIsUnlocked(false);
        }
      } catch {
        setIsUnlocked(defaultUnlocked);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [defaultUnlocked, storageKey]);

  const unlock = useCallback(
    (inputKey: string) => {
      if (inputKey.trim() !== accessKey) {
        return false;
      }

      setIsUnlocked(true);
      try {
        window.localStorage.setItem(storageKey, "unlocked");
      } catch {
        // Access still works for the current tab if storage is unavailable.
      }

      return true;
    },
    [accessKey, storageKey],
  );

  const lock = useCallback(() => {
    setIsUnlocked(false);
    try {
      window.localStorage.setItem(storageKey, "locked");
    } catch {
      // Locking still works for the current tab if storage is unavailable.
    }
  }, [storageKey]);

  return {
    isUnlocked,
    unlock,
    lock,
  };
}
