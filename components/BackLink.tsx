import Link from "next/link";
import { focusRing } from "./ui/styles";

/** "‹ Today" at the top of detail pages, so the way back is always visible. */
export function BackLink() {
  return (
    <Link href="/" className={`-ml-2 inline-flex min-h-11 w-fit items-center gap-1 rounded-full px-2 font-ct-sans text-sm font-medium text-ct-linen hover:text-ct-text ${focusRing}`}>
      <span aria-hidden="true">‹</span> Today
    </Link>
  );
}
