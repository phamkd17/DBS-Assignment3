import type { ComponentProps } from "react";
import { control } from "./styles";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${control} ${className}`} {...props} />;
}
