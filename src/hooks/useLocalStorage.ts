"use client";

import { useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      window.localStorage.removeItem(key);
    } finally {
      loaded.current = true;
    }
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable or full; the in-memory conversation remains usable.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
