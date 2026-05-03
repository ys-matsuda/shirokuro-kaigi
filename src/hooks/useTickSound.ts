"use client";

import { useCallback, useEffect, useRef } from "react";

type UseTickSoundOptions = {
  enabled: boolean;
  step: number;
  volume: number;
  minIntervalMs: number;
};

type BrowserWindowWithWebkitAudio = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

export function useTickSound({
  enabled,
  step,
  volume,
  minIntervalMs,
}: UseTickSoundOptions) {
  const contextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  const lastBucketRef = useRef<number | null>(null);
  const lastPlayedAtRef = useRef(0);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!contextRef.current) {
      const browserWindow = window as BrowserWindowWithWebkitAudio;
      const AudioContextConstructor =
        browserWindow.AudioContext ?? browserWindow.webkitAudioContext;

      if (!AudioContextConstructor) return null;
      contextRef.current = new AudioContextConstructor();
    }

    return contextRef.current;
  }, []);

  const primeTickSound = useCallback(() => {
    const context = getAudioContext();
    if (context?.state === "suspended") {
      void context.resume();
    }
  }, [getAudioContext]);

  const playTickForValue = useCallback(
    (value: number) => {
      if (!enabledRef.current) return;

      const bucket = Math.round(value / step);
      if (bucket === lastBucketRef.current) return;

      const now = performance.now();
      if (now - lastPlayedAtRef.current < minIntervalMs) return;

      const context = getAudioContext();
      if (!context) return;

      if (context.state === "suspended") {
        void context.resume();
      }

      lastBucketRef.current = bucket;
      lastPlayedAtRef.current = now;

      const startedAt = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(230 + (bucket % 4) * 18, startedAt);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(920, startedAt);

      gain.gain.setValueAtTime(0.0001, startedAt);
      gain.gain.exponentialRampToValueAtTime(volume, startedAt + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.045);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);

      oscillator.start(startedAt);
      oscillator.stop(startedAt + 0.05);
    },
    [getAudioContext, minIntervalMs, step, volume],
  );

  return {
    playTickForValue,
    primeTickSound,
  };
}
