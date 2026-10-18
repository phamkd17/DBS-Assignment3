import { focusRing } from "./styles";

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** A small on/off switch. The whole row (track + label) is one button with role="switch". */
export function Switch({ label, checked, onChange }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full pr-2 font-ct-sans text-sm font-medium text-ct-linen ${focusRing}`}
    >
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors duration-200 ${
          checked ? "border-ct-selected bg-ct-selected" : "border-ct-border bg-ct-raised group-hover:border-ct-linen"
        }`}
      >
        <span
          className={`absolute size-4 rounded-full transition-[left,background-color] duration-200 ${checked ? "left-5 bg-ct-text" : "left-1 bg-ct-muted"}`}
        />
      </span>
      {label}
    </button>
  );
}
