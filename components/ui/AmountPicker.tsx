"use client";

import { useEffect, useId, useRef } from "react";
import { FieldError } from "./Field";
import { Input } from "./Input";
import { label as labelStyle, radioInput, radioPill } from "./styles";

export type AmountValue = { choice: number | "custom" | null; custom: string };

export const EMPTY_AMOUNT: AmountValue = { choice: null, custom: "" };

/**
 * The picked number: a preset, the parsed custom entry (NaN if not a number), or null if
 * nothing is picked yet. `customScale` converts the custom unit to the preset unit
 * (e.g. 60 when presets are seconds but the custom field is in minutes).
 */
export function resolveAmount(value: AmountValue, customScale = 1): number | null {
  if (value.choice === null) return null;
  if (value.choice !== "custom") return value.choice;
  const typed = value.custom.trim();
  return typed === "" ? Number.NaN : Number(typed) * customScale;
}

type Props = {
  legend: string;
  name: string;
  presets: { value: number; label: string }[];
  /** Label for the manual entry field, e.g. "Custom minutes". */
  customLabel: string;
  customHint?: string;
  value: AmountValue;
  onChange: (value: AmountValue) => void;
  error?: string;
};

/** Preset amounts as pills, plus a "Custom" pill that opens a manual entry field. */
export function AmountPicker({ legend, name, presets, customLabel, customHint, value, onChange, error }: Props) {
  const id = useId();
  const customRef = useRef<HTMLInputElement>(null);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const isCustom = value.choice === "custom";

  // Opening Custom moves the cursor straight into the field.
  const wasCustom = useRef(isCustom);
  useEffect(() => {
    if (isCustom && !wasCustom.current) customRef.current?.focus();
    wasCustom.current = isCustom;
  }, [isCustom]);

  const options: { key: string; choice: number | "custom"; label: string }[] = [
    ...presets.map((p) => ({ key: String(p.value), choice: p.value, label: p.label })),
    { key: "custom", choice: "custom", label: "Custom" },
  ];

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error && !isCustom ? errorId : undefined}>
      <legend className={`${labelStyle} mb-2`}>{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.key} className="relative">
            <input
              type="radio"
              name={name}
              value={option.key}
              checked={value.choice === option.choice}
              onChange={() => onChange({ ...value, choice: option.choice })}
              className={radioInput}
            />
            <span
              className={`${radioPill} ${error && !isCustom ? "border-ct-error" : ""}`}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>

      {isCustom && (
        <div className="mt-2 flex flex-col gap-2">
          <label htmlFor={`${id}-custom`} className={labelStyle}>
            {customLabel}
          </label>
          {customHint && (
            <p id={hintId} className="font-ct-sans text-sm text-ct-muted">
              {customHint}
            </p>
          )}
          <Input
            ref={customRef}
            id={`${id}-custom`}
            inputMode="decimal"
            autoComplete="off"
            value={value.custom}
            onChange={(e) => onChange({ ...value, custom: e.target.value })}
            aria-invalid={error ? true : undefined}
            aria-describedby={[customHint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined}
          />
        </div>
      )}

      {error && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
}
