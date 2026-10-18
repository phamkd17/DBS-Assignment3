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
};

/** A one-of-many choice shown as pills. Native radios, so arrow keys and screen readers just work. */
export function ChoiceGroup<T extends string>({ legend, name, options, value, onChange, error }: Props<T>) {
  const errorId = useId();
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? errorId : undefined}>
      <legend className={`${labelStyle} mb-1.5`}>{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
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
