import type { ReactNode } from "react";

/** Every page opens with the same heading block, so it's always clear where you are. */
type Props = {
  title: string;
  /** A control at the right end of the title row (e.g. a switch). */
  action?: ReactNode;
  /** A small line right under the title (e.g. today's totals). */
  subline?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({ title, action, subline, children }: Props) {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-ct-serif text-3xl italic text-ct-text sm:text-4xl">{title}</h1>
        {action}
      </div>
      {subline && <div className="-mt-1.5">{subline}</div>}
      {children && <p className="font-ct-sans text-[15px] text-ct-linen">{children}</p>}
    </header>
  );
}
