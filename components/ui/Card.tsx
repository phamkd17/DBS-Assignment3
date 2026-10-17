import type { HTMLAttributes } from "react";
import { card } from "./styles";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`${card} ${className}`} {...props} />;
}
