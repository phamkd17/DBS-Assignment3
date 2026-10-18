"use client";

import { useRef, useState, type KeyboardEvent } from "react";

/**
 * One tab stop for a group of chart marks: arrow keys move between them, and the active
 * mark shows the same tooltip on focus as on hover. `step` maps a key to an index delta.
 * `count` can change between renders (e.g. fewer days before data loads); the tab stop
 * starts on the last mark and is clamped to it.
 */
export function useRoving(count: number, step: (key: string) => number | null) {
  const [chosen, setActive] = useState<number | null>(null);
  const active = Math.min(chosen ?? count - 1, count - 1);
  const [shown, setShown] = useState<number | null>(null);
  const refs = useRef<(HTMLElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const delta = step(event.key);
    if (delta === null) return;
    const next = Math.max(0, Math.min(count - 1, index + delta));
    event.preventDefault();
    setActive(next);
    setShown(next);
    refs.current[next]?.focus();
  }

  const markProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      refs.current[index] = el;
    },
    tabIndex: index === active ? 0 : -1,
    onKeyDown: (e: KeyboardEvent) => onKeyDown(e, index),
    onFocus: () => {
      setActive(index);
      setShown(index);
    },
    onBlur: () => setShown(null),
    onPointerEnter: () => setShown(index),
    onPointerLeave: () => setShown(null),
  });

  return { shown, markProps };
}
