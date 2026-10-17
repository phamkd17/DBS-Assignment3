// Candlelit Table component styles (ported from Assignment 2): warm dark surfaces, soft pill
// controls, and a candle glow that brightens on hover and sinks inward on press.

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-3 focus-visible:outline-ct-accent";

export const label = "font-ct-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-ct-muted";

const pill =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 font-ct-sans text-[15px] font-semibold transition-[background-color,box-shadow,color] duration-200 select-none cursor-pointer";

export const button = {
  primary: `${pill} ${focusRing} bg-ct-accent text-ct-bg enabled:hover:bg-ct-accent-hover enabled:hover:shadow-ct-glow-strong enabled:active:bg-ct-accent-pressed enabled:active:shadow-ct-press disabled:cursor-not-allowed disabled:bg-ct-disabled disabled:text-ct-muted/70`,
  secondary: `${pill} ${focusRing} border border-ct-border text-ct-text enabled:hover:border-ct-linen enabled:hover:bg-ct-raised enabled:active:bg-ct-bg enabled:active:shadow-ct-press disabled:cursor-not-allowed disabled:border-ct-hairline disabled:text-ct-muted/60`,
  ghost: `inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 font-ct-sans text-sm font-medium text-ct-linen transition-colors hover:bg-ct-raised hover:text-ct-text cursor-pointer ${focusRing}`,
};

export const chip = `inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 font-ct-sans text-sm font-medium transition-colors duration-200 select-none cursor-pointer ${focusRing} border-ct-border bg-ct-surface text-ct-linen hover:border-ct-linen hover:bg-ct-raised active:bg-ct-bg aria-pressed:border-ct-selected aria-pressed:bg-ct-selected aria-pressed:text-ct-text`;

/** A pill that sits next to a visually hidden native radio (`peer`), used by ChoiceGroup and AmountPicker. */
export const radioPill =
  "inline-flex min-h-11 items-center rounded-full border px-5 font-ct-sans text-[15px] font-medium transition-colors border-ct-border bg-ct-surface text-ct-linen peer-hover:border-ct-linen peer-checked:border-ct-selected peer-checked:bg-ct-selected peer-checked:text-ct-text peer-focus-visible:outline-2 peer-focus-visible:outline-solid peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ct-accent";

/** The hidden native radio under a radioPill. */
export const radioInput = "peer absolute inset-0 cursor-pointer opacity-0";

export const control =
  "h-11 w-full rounded-[10px] border bg-ct-raised px-4 font-ct-sans text-[15px] text-ct-text placeholder:text-ct-muted transition-colors duration-200 border-ct-border hover:border-ct-linen aria-invalid:border-ct-error " +
  focusRing;

export const link = `rounded-sm font-ct-sans font-medium text-ct-caramel underline decoration-ct-caramel/50 underline-offset-4 transition-colors hover:text-ct-accent hover:decoration-ct-accent ${focusRing}`;

export const card = "rounded-xl bg-ct-surface p-5 shadow-ct-glow";
