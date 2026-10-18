"use client";

import { useSyncExternalStore } from "react";
import { isStorageAvailable } from "@/lib/storage";

let cached: boolean | undefined;
const getSnapshot = () => (cached ??= isStorageAvailable());
const subscribe = () => () => {};

/** If the browser won't let us save (private mode, storage full), say so before anything is lost. */
export function StorageWarning() {
  const available = useSyncExternalStore(subscribe, getSnapshot, () => true);
  if (available) return null;
  return (
    <div role="alert" className="rounded-xl border border-ct-error bg-ct-surface p-4 font-ct-sans text-[15px] text-ct-text">
      <strong className="font-semibold">Can&apos;t save on this device.</strong> Your browser is blocking storage (private browsing or full storage), so entries
      will be lost when you close this tab. Open the app in a regular window to keep your history.
    </div>
  );
}
