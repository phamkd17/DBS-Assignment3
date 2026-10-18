"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { control } from "./styles";

type Option = { value: string; label: string };

type Props = {
  /** From Field: id (so the <label> names the button), aria-invalid (shown as a red border; the
   *  error text is announced via aria-describedby), aria-describedby. */
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  name?: string;
};

/**
 * A themed single-select dropdown. Native <select> menus are drawn by the OS (white popups on
 * Android), so this renders its own list in the app's colors. Follows the ARIA listbox pattern:
 * a button opens a listbox; ↑/↓ move, Home/End jump, Enter/Space choose, Esc closes, typing a
 * letter jumps to the next option starting with it.
 */
export function Listbox({ id, value, onChange, options, placeholder, name, ...aria }: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);

  // Close when focus or a tap goes outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!buttonRef.current?.parentElement?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the active option in view and focus the list when it opens.
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function openList() {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function choose(index: number) {
    onChange(options[index].value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onButtonKey(e: KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  }

  function onListKey(e: KeyboardEvent) {
    const last = options.length - 1;
    const moves: Record<string, () => number> = {
      ArrowDown: () => Math.min(last, active + 1),
      ArrowUp: () => Math.max(0, active - 1),
      Home: () => 0,
      End: () => last,
    };
    if (moves[e.key]) {
      e.preventDefault();
      setActive(moves[e.key]());
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      setOpen(false);
      if (e.key === "Escape") buttonRef.current?.focus();
    } else if (e.key.length === 1) {
      // Type-ahead: next option starting with that letter.
      const letter = e.key.toLowerCase();
      for (let step = 1; step <= options.length; step++) {
        const i = (active + step) % options.length;
        if (options[i].label.toLowerCase().startsWith(letter)) {
          setActive(i);
          break;
        }
      }
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        name={name}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-describedby={aria["aria-describedby"]}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKey}
        className={`${control} flex cursor-pointer items-center justify-between gap-3 text-left ${aria["aria-invalid"] ? "border-ct-error" : ""}`}
      >
        <span className={`truncate ${selected ? "text-ct-text" : "text-ct-muted/75"}`}>{selected ? selected.label : placeholder}</span>
        <span aria-hidden="true" className="shrink-0 text-ct-muted">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={id}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKey}
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-ct-border bg-ct-raised p-1 shadow-ct-glow-strong outline-none"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                data-index={i}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 font-ct-sans text-[15px] ${
                  isSelected ? "bg-ct-selected text-ct-text" : i === active ? "bg-ct-surface text-ct-text" : "text-ct-linen"
                } ${i === active ? "outline-2 outline-solid outline-offset-[-2px] outline-ct-accent" : ""}`}
              >
                <span>{o.label}</span>
                {isSelected && <span aria-hidden="true">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
