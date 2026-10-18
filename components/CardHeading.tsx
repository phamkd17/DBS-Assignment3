import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "./ui/styles";

type Props = {
  title: string;
  /** Detail page for this section; the title becomes a link to it. */
  href?: string;
  /** A control at the right end of the row (e.g. a switch). */
  action?: ReactNode;
};

/** A card's heading row. Linked titles look like links (caramel, underlined, ›) so it's clear they open a page. */
export function CardHeading({ title, href, action }: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-ct-serif text-lg italic text-ct-text sm:text-2xl">
        {href ? (
          // Always styled as a link (caramel + underline + ›) so it's clear the title opens a page.
          <Link
            href={href}
            className={`rounded-md text-ct-caramel underline decoration-ct-caramel/60 decoration-1 underline-offset-4 transition-colors hover:text-ct-accent hover:decoration-ct-accent ${focusRing}`}
          >
            {title}
            <span aria-hidden="true" className="ml-1 not-italic">
              ›
            </span>
          </Link>
        ) : (
          title
        )}
      </h2>
      {action}
    </div>
  );
}
