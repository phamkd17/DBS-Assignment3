"use client";

import { useId } from "react";
import { FieldError } from "./Field";
import { label as labelStyle, radioInput, radioPill } from "./styles";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  legend: string;
  name: string;
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
  /** Hide the legend visually (screen readers still announce it) when the options explain themselves. */
  hideLegend?: boolean;
  /**
   * Switch options without stealing focus from a text field that's being typed in, so the phone
   * keyboard stays open (e.g. flipping Eaten/Burned while entering calories).
   */
  keepTypingFocus?: boolean;
};

/** Is a text-entry field focused (the on-screen keyboard is up)? */
function typingInField(): boolean {
  const el = document.activeElement;
  return el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && !["radio", "checkbox", "button", "submit"].includes(el.type));
}

/** A one-of-many choice shown as pills. Native radios, so arrow keys and screen readers just work. */
export function ChoiceGroup<T extends string>({ legend, name, options, value, onChange, error, hideLegend = false, keepTypingFocus = false }: Props<T>) {
  const errorId = useId();
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? errorId : undefined}>
      <legend className={hideLegend ? "sr-only" : `${labelStyle} mb-1 sm:mb-1.5`}>{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              // Cancelling mousedown keeps focus (and the keyboard) in the field; the click still selects.
              onMouseDown={keepTypingFocus ? (e) => typingInField() && e.preventDefault() : undefined}
              className={radioInput}
            />
            <span
              className={`${radioPill} ${error ? "border-ct-error" : ""}`}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
}
