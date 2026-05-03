"use client";

import { useCallback, useState } from "react";

import { roundMeterValue } from "@/utils/meterMath";

export function useSpeakerMeter(initialValue = 50) {
  const [value, setValue] = useState(() => roundMeterValue(initialValue));

  const updateValue = useCallback((nextValue: number) => {
    setValue(roundMeterValue(nextValue));
  }, []);

  const resetValue = useCallback((nextValue = 50) => {
    setValue(roundMeterValue(nextValue));
  }, []);

  return {
    value,
    setValue: updateValue,
    resetValue,
  };
}
