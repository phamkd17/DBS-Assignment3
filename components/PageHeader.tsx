import type { ReactNode } from "react";

/** Every page opens with the same heading block, so it's always clear where you are. */
type Props = {
  title: string;
  /** Small inline text after the title, inside the heading (e.g. "42 min today"). */
  aside?: ReactNode;
  /** A control at the right end of the title row (e.g. a switch). */
  action?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({ title, aside, action, children }: Props) {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-ct-serif text-4xl italic text-ct-text">
          {title}
          {aside}
        </h1>
        {action}
      </div>
      {children && <p className="font-ct-sans text-[15px] text-ct-linen">{children}</p>}
    </header>
  );
}
