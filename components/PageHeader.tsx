import type { ReactNode } from "react";

/** Every page opens with the same heading block, so it's always clear where you are. */
export function PageHeader({ title, aside, children }: { title: string; aside?: ReactNode; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="font-ct-serif text-4xl italic text-ct-text">
        {title}
        {aside}
      </h1>
      {children && <p className="font-ct-sans text-[15px] text-ct-linen">{children}</p>}
    </header>
  );
}
