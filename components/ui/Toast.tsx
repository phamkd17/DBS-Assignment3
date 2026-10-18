"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { button } from "./styles";

type ToastMessage = { id: number; text: string; onUndo?: () => void };

const ToastContext = createContext<(text: string, onUndo?: () => void) => void>(() => {});

/** Show a short confirmation, optionally with an Undo action. */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const nextId = useRef(0);

  // Shown at the top (away from what you tap), hidden after 2 s or as soon as you tap anywhere outside it. The timer pauses while the
  // pointer or keyboard focus is on the toast, so it can't vanish as you reach for Undo.
  const [paused, setPaused] = useState(false);

  const show = useCallback((text: string, onUndo?: () => void) => {
    nextId.current += 1;
    setPaused(false); // every new toast starts its own 2 s
    setToast({ id: nextId.current, text, onUndo });
  }, []);
  const toastRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!toast || paused) return;
    const timer = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(timer);
  }, [toast, paused]);
  useEffect(() => {
    if (!toast) return;
    const onDown = (e: PointerEvent) => {
      if (toastRef.current?.contains(e.target as Node)) return;
      setToast(null);
      setPaused(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 top-[max(0.5rem,env(safe-area-inset-top))] z-50 flex justify-center px-4 sm:top-16">
        {toast && (
          <div
            key={toast.id}
            ref={toastRef}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-ct-text py-1.5 pr-1.5 pl-5 font-ct-sans text-[15px] font-medium text-ct-bg shadow-ct-glow-strong"
          >
            <span>{toast.text}</span>
            {toast.onUndo && (
              <button
                type="button"
                onClick={() => {
                  toast.onUndo?.();
                  setToast(null);
                  setPaused(false);
                }}
                className={`${button.ghost} bg-ct-bg text-ct-text hover:bg-ct-raised`}
              >
                Undo
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
