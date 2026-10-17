import type { ComponentProps } from "react";
import { control } from "./styles";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${control} ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: ComponentProps<"select">) {
  return (
    <select className={`${control} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%23cbb89a%22 stroke-width=%221.5%22 fill=%22none%22/></svg>')] bg-[position:right_1rem_center] bg-no-repeat pr-10 ${className}`} {...props}>
      {children}
    </select>
  );
}
