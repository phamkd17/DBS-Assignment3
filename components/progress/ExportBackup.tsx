"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { FieldError } from "../ui/Field";
import { readBackup, type Backup } from "@/lib/backup";
import { formatDay, today } from "@/lib/dates";
import { clearHistory, exportJson, importBackup, useRoutineData } from "@/lib/storage";

/** Download everything as a .json file, import a saved backup, or clear all history. Changes have a confirm step and Undo. */
export function ExportBackup() {
  const toast = useToast();
  const data = useRoutineData();
  const [confirming, setConfirming] = useState(false);
  const clearRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState<{ name: string; backup: Backup; count: number; skipped: number; first: string | null; last: string | null } | null>(
    null,
  );
  const [importError, setImportError] = useState<string>();
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

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // so choosing the same file again still fires
    if (!file) return;
    const result = readBackup(await file.text());
    if (!result.ok) {
      setPending(null);
      setImportError(result.error);
      importRef.current?.focus();
      return;
    }
    setImportError(undefined);
    setPending({ name: file.name, ...result });
  }

  function confirmImport(mode: "merge" | "replace") {
    if (!pending) return;
    const { added, undo } = importBackup(pending.backup, mode);
    const skipped = pending.skipped ? ` · ${pending.skipped} unreadable skipped` : "";
    setPending(null);
    toast(mode === "replace" ? `Replaced with ${added} entries${skipped}` : `Imported ${added} new ${added === 1 ? "entry" : "entries"}${skipped}`, undo);
    requestAnimationFrame(() => importRef.current?.focus());
  }

  const range = (first: string | null, last: string | null) =>
    first && last
      ? first === last
        ? formatDay(first, { month: "short", day: "numeric" })
        : `${formatDay(first, { month: "short", day: "numeric" })} – ${formatDay(last, { month: "short", day: "numeric", year: "numeric" })}`
      : "";

  return (
    <div className="flex flex-col gap-3 sm:gap-5">
      <p className="font-ct-sans text-[15px] text-ct-linen">
        Your data lives only in this browser. Download a copy so clearing the browser doesn&apos;t erase your history, and import it to restore or move to a new
        device.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={download}>
          Download backup (.json)
        </Button>
        <Button ref={importRef} variant="secondary" onClick={() => fileRef.current?.click()} aria-describedby={importError ? "import-error" : undefined}>
          Import backup (.json)
        </Button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="sr-only" tabIndex={-1} aria-hidden="true" />
      </div>
      {importError && <FieldError id="import-error">{importError}</FieldError>}

      {pending && (
        <div
          role="alertdialog"
          aria-labelledby="import-title"
          aria-describedby="import-desc"
          className="flex flex-col gap-3 rounded-xl border border-ct-border p-4"
        >
          <p id="import-title" className="font-ct-sans text-[15px] font-semibold break-all text-ct-text">
            Import &ldquo;{pending.name}&rdquo;?
          </p>
          <p id="import-desc" className="font-ct-sans text-sm text-ct-linen">
            {pending.count} {pending.count === 1 ? "entry" : "entries"}
            {range(pending.first, pending.last) && ` · ${range(pending.first, pending.last)}`}
            {pending.skipped > 0 && ` · ${pending.skipped} unreadable (will be skipped)`}. Merge adds anything not already here; Replace swaps your current
            history for this file.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => confirmImport("merge")}>Merge with current</Button>
            <Button variant="danger" onClick={() => confirmImport("replace")}>
              Replace current
            </Button>
            <Button
              variant="ghost"
              autoFocus
              onClick={() => {
                setPending(null);
                requestAnimationFrame(() => importRef.current?.focus());
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-ct-hairline pt-3 sm:pt-5">
        {!confirming ? (
          <div>
            <Button ref={clearRef} variant="danger" disabled={count === 0} onClick={() => setConfirming(true)}>
              Clear history…
            </Button>
            {count === 0 && <p className="mt-2 font-ct-sans text-xs text-ct-muted/70">Nothing to clear yet.</p>}
          </div>
        ) : (
          <div
            role="alertdialog"
            aria-labelledby="clear-title"
            aria-describedby="clear-desc"
            className="flex flex-col gap-3 rounded-xl border border-ct-error p-4"
          >
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
