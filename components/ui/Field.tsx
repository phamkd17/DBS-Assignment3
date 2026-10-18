"use client";

import { useId, type ReactNode } from "react";
import { label as labelStyle } from "./styles";

export type FieldControlProps = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

type Props = {
  label: string;
  hint?: string;
  /** Says what to do next, e.g. "Enter minutes, like 15." Shown right under the control. */
  error?: string;
  children: (control: FieldControlProps) => ReactNode;
};

/** A labelled form field. The control is wired to its label, hint, and error for screen readers. */
export function Field({ label, hint, error, children }: Props) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelStyle}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className="font-ct-sans text-sm text-ct-muted">
          {hint}
        </p>
      )}
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {error && <FieldError id={errorId!}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-2 font-ct-sans text-sm font-medium text-ct-error">
      <span aria-hidden="true">!</span>
      {children}
    </p>
  );
}
