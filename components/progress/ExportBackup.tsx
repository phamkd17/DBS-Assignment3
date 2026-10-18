"use client";

import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { today } from "@/lib/dates";
import { exportJson } from "@/lib/storage";

/** Download everything as a .json file, in case the browser's storage gets cleared. */
export function ExportBackup() {
  const toast = useToast();
  return (
    <div className="flex flex-col gap-3">
      <p className="font-ct-sans text-[15px] text-ct-linen">Your data lives only in this browser. Download a copy so clearing the browser doesn&apos;t erase your history.</p>
      <div>
        <Button
          variant="secondary"
          onClick={() => {
            const url = URL.createObjectURL(new Blob([exportJson()], { type: "application/json" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = `routine-backup-${today()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast("Backup downloaded");
          }}
        >
          Download backup (.json)
        </Button>
      </div>
    </div>
  );
}
