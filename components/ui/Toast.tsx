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

  const show = useCallback((text: string, onUndo?: () => void) => {
    nextId.current += 1;
    setToast({ id: nextId.current, text, onUndo });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 sm:bottom-6">
        {toast && (
          <div key={toast.id} className="pointer-events-auto flex items-center gap-3 rounded-full bg-ct-text py-1.5 pr-1.5 pl-5 font-ct-sans text-[15px] font-medium text-ct-bg shadow-ct-glow-strong">
            <span>{toast.text}</span>
            {toast.onUndo && (
              <button
                type="button"
                onClick={() => {
                  toast.onUndo?.();
                  setToast(null);
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
