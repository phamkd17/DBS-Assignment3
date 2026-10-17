type Props = {
  /** Visible label, e.g. "Shoulder this week". */
  label: string;
  value: number;
  max: number;
  /** Text shown on the right, e.g. "6 / 10 min". */
  valueText: string;
};

export function ProgressBar({ label, value, max, valueText }: Props) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const complete = value >= max;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-4 font-ct-sans text-sm">
        <span className="text-ct-linen">{label}</span>
        <span className={complete ? "font-semibold text-ct-success" : "text-ct-muted"}>
          {valueText}
          {complete && " ✓"}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(value, max)}
        aria-valuetext={valueText}
        className="h-2.5 overflow-hidden rounded-full bg-ct-raised"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${complete ? "bg-ct-success" : "bg-ct-accent"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
