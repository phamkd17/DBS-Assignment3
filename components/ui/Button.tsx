import type { ButtonHTMLAttributes } from "react";
import { button } from "./styles";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof button;
};

export function Button({ variant = "primary", className = "", type = "button", ...props }: Props) {
  return <button type={type} className={`${button[variant]} ${className}`} {...props} />;
}
