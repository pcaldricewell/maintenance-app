"use client";

import { useEffect, useRef, useState } from "react";

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const hydrated = useRef(false);

  // Load once on client
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore
    } finally {
      hydrated.current = true;
    }
  }, [key]);

  // Save on change (after hydration)
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export const storageKeys = {
  workOrders: "maint.workOrders",
  equipment: "maint.equipment",
  vendors: "maint.vendors",
  settings: "maint.settings",
};
