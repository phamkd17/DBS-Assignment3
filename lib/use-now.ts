"use client";

import { useSyncExternalStore } from "react";

// The current minute, as a shared clock that ticks once a minute. Returns null on the server.

function subscribe(listener: () => void): () => void {
  const timer = window.setInterval(listener, 15_000);
  return () => window.clearInterval(timer);
}

const getMinute = () => Math.floor(Date.now() / 60_000);

export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribe, getMinute, () => null);
  return minute === null ? null : new Date(minute * 60_000);
}
