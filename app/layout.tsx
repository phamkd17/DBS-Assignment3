import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { Nav } from "@/components/Nav";
import { StorageWarning } from "@/components/StorageWarning";
import { ToastProvider } from "@/components/ui/Toast";
import { focusRing } from "@/components/ui/styles";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-fraunces",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "Routine: stretch, study, calories",
  description: "A daily tracker for stretching streaks, FE Mechanical study time, and net calories. Saved on this device.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable} h-full antialiased`}>
      <body className="min-h-full font-ct-sans">
        <a
          href="#main"
          className={`sr-only z-50 rounded-full bg-ct-accent px-5 py-3 font-semibold text-ct-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 ${focusRing}`}
        >
          Skip to content
        </a>
        <ToastProvider>
          <Nav />
          <main id="main" className="mx-auto flex max-w-2xl flex-col gap-2 px-3 pt-1 pb-32 sm:gap-3 sm:px-6 sm:pt-8 sm:px-6 sm:pb-16">
            <StorageWarning />
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
