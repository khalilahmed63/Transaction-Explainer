import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { APP_NAME, GITHUB_URL } from "@/config/app";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <ArrowLeftRight className="size-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-[15px]">
            {APP_NAME}
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
          <Link
            href="/#features"
            className="hidden rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:inline"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            How it works
          </Link>
          <Link
            href="/#faq"
            className="hidden rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:inline"
          >
            FAQ
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:inline"
          >
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
