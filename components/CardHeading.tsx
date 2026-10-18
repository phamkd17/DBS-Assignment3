import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "./ui/styles";

type Props = {
  title: string;
  /** Detail page for this section; the title becomes a link to it. */
  href?: string;
  /** Small inline text after the title (e.g. "42 min today"). */
  aside?: ReactNode;
  /** A control at the right end of the row (e.g. a switch). */
  action?: ReactNode;
};

/** A card's heading row. Linked titles show a › so it's clear they open a page. */
export function CardHeading({ title, href, aside, action }: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-ct-serif text-2xl italic text-ct-text">
        {href ? (
          <Link href={href} className={`rounded-md decoration-ct-accent underline-offset-4 hover:underline ${focusRing}`}>
            {title}{" "}
            <span aria-hidden="true" className="not-italic text-ct-muted">
              ›
            </span>
          </Link>
        ) : (
          title
        )}
        {aside}
      </h2>
      {action}
    </div>
  );
}
