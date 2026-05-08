"use client";

import { useCallback, useEffect, useState } from "react";

import { appConfig } from "@/config/app";

const storageKey = "consensus-meter:host-access:v1";

export function useHostAccess() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    appConfig.access.hostUnlockedByDefault,
  );

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
        setIsUnlocked(appConfig.access.hostUnlockedByDefault);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const unlock = useCallback((hostKey: string) => {
    if (hostKey.trim() !== appConfig.access.hostKey) {
      return false;
    }

    setIsUnlocked(true);
    try {
      window.localStorage.setItem(storageKey, "unlocked");
    } catch {
      // Access still works for the current tab if storage is unavailable.
    }

    return true;
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    try {
      window.localStorage.setItem(storageKey, "locked");
    } catch {
      // Locking still works for the current tab if storage is unavailable.
    }
  }, []);

  return {
    isHostUnlocked: isUnlocked,
    unlockHost: unlock,
    lockHost: lock,
  };
}
