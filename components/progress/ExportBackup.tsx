"use client";

import { useRef, useState } from "react";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { today } from "@/lib/dates";
import { clearHistory, exportJson, useRoutineData } from "@/lib/storage";

/** Download everything as a .json file; clear all history (with a confirm step and Undo). */
export function ExportBackup() {
  const toast = useToast();
  const data = useRoutineData();
  const [confirming, setConfirming] = useState(false);
  const clearRef = useRef<HTMLButtonElement>(null);
  const count = data ? data.stretches.length + data.study.length + data.calories.length : 0;

  function download() {
    const url = URL.createObjectURL(new Blob([exportJson()], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `routine-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup downloaded");
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="font-ct-sans text-[15px] text-ct-linen">Your data lives only in this browser. Download a copy so clearing the browser doesn&apos;t erase your history.</p>
      <div>
        <Button variant="secondary" onClick={download}>
          Download backup (.json)
        </Button>
      </div>

      <div className="flex flex-col gap-3 border-t border-ct-hairline pt-5">
        {!confirming ? (
          <div>
            <Button ref={clearRef} variant="danger" disabled={count === 0} onClick={() => setConfirming(true)}>
              Clear history…
            </Button>
            {count === 0 && <p className="mt-2 font-ct-sans text-xs text-ct-muted/70">Nothing to clear yet.</p>}
          </div>
        ) : (
          <div role="alertdialog" aria-labelledby="clear-title" aria-describedby="clear-desc" className="flex flex-col gap-3 rounded-xl border border-ct-error p-4">
            <p id="clear-title" className="font-ct-sans text-[15px] font-semibold text-ct-text">
              Delete all {count} {count === 1 ? "entry" : "entries"}?
            </p>
            <p id="clear-desc" className="font-ct-sans text-sm text-ct-linen">
              This deletes every stretch, study, and calorie entry on this device, and resets your streaks. Your settings stay.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={download}>
                Download backup first
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const undo = clearHistory();
                  setConfirming(false);
                  toast("History cleared", undo);
                }}
              >
                Delete everything
              </Button>
              {/* Focus starts on Cancel so Enter never deletes by accident. */}
              <Button
                variant="ghost"
                autoFocus
                onClick={() => {
                  setConfirming(false);
                  requestAnimationFrame(() => clearRef.current?.focus());
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
