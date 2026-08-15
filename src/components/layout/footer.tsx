import Link from "next/link";
import {
  APP_NAME,
  APP_TAGLINE,
  DISCLAIMER,
  GITHUB_URL,
} from "@/config/app";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface/50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{APP_NAME}</p>
            <p className="mt-1 max-w-sm text-sm text-muted">{APP_TAGLINE}</p>
          </div>
          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted"
            aria-label="Footer"
          >
            <Link href="/#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="/#how-it-works" className="hover:text-foreground">
              How it works
            </Link>
            <Link href="/#about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/#faq" className="hover:text-foreground">
              FAQ
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </nav>
        </div>
        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted/80">
          {DISCLAIMER}
        </p>
        <p className="mt-3 text-xs text-muted/60">Version 0.1</p>
      </div>
    </footer>
  );
}
