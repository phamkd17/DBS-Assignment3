import type { ButtonHTMLAttributes } from "react";
import { chip } from "./styles";

/** A small pill button for one-tap actions and presets. Pass aria-pressed to show it as selected. */
export function Chip({ className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`${chip} ${className}`} {...props} />;
}
