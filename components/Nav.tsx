"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { focusRing } from "./ui/styles";

export const NAV_ITEMS = [
  { href: "/", label: "Today" },
  { href: "/progress", label: "Progress" },
] as const;

/**
 * Shared navigation: a top bar on wide screens, a bottom tab bar on phones. Two tabs only;
 * the Stretch, Study, and Calories detail pages open from Today's cards and count as Today.
 */
export function Nav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-ct-hairline bg-ct-bg/95 backdrop-blur sm:sticky sm:top-0 sm:bottom-auto sm:border-t-0 sm:border-b">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-3 sm:px-6">
        <Link href="/" className={`hidden rounded-md py-4 font-ct-serif text-xl italic text-ct-text sm:block ${focusRing}`}>
          Routine
        </Link>
        <ul className="flex w-full justify-around sm:w-auto sm:gap-1">
          {NAV_ITEMS.map((item) => {
            const current = item.href === "/" ? pathname !== "/progress" : pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? (pathname === item.href ? "page" : "true") : undefined}
                  className={`relative inline-flex min-h-14 items-center rounded-md px-2.5 font-ct-sans text-sm font-medium transition-colors sm:min-h-11 sm:px-3 ${focusRing} after:absolute after:inset-x-2.5 after:bottom-2 after:h-0.5 after:rounded-full sm:after:bottom-1 ${
                    current ? "text-ct-text after:bg-ct-accent" : "text-ct-muted hover:text-ct-text after:bg-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
