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
      const clickOscillator = context.createOscillator();
      const bodyOscillator = context.createOscillator();
      const gain = context.createGain();
      const bodyGain = context.createGain();
      const filter = context.createBiquadFilter();

      clickOscillator.type = "triangle";
      clickOscillator.frequency.setValueAtTime(190 + (bucket % 5) * 12, startedAt);
      clickOscillator.frequency.exponentialRampToValueAtTime(145, startedAt + 0.045);

      bodyOscillator.type = "sine";
      bodyOscillator.frequency.setValueAtTime(86 + (bucket % 3) * 6, startedAt);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(720, startedAt);
      filter.Q.setValueAtTime(0.9, startedAt);

      gain.gain.setValueAtTime(0.0001, startedAt);
      gain.gain.exponentialRampToValueAtTime(volume, startedAt + 0.007);
      gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.056);

      bodyGain.gain.setValueAtTime(0.0001, startedAt);
      bodyGain.gain.exponentialRampToValueAtTime(volume * 0.32, startedAt + 0.01);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.075);

      clickOscillator.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      bodyOscillator.connect(bodyGain);
      bodyGain.connect(context.destination);

      clickOscillator.start(startedAt);
      clickOscillator.stop(startedAt + 0.06);
      bodyOscillator.start(startedAt);
      bodyOscillator.stop(startedAt + 0.08);
    },
    [getAudioContext, minIntervalMs, step, volume],
  );

  return {
    playTickForValue,
    primeTickSound,
  };
}
