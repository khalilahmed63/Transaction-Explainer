import type { Metadata } from "next";
import {
  ArrowLeftRight,
  CircleHelp,
  Fuel,
  Gift,
  Layers2,
  Send,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { TransactionSearch } from "@/components/transaction/transaction-search";
import { EmptyState } from "@/components/transaction/empty-state";
import { ChainIcon } from "@/components/ui/chain-icon";
import {
  APP_DESCRIPTION,
  APP_FAQ,
  APP_FEATURES,
  APP_LONG_DESCRIPTION,
  APP_NAME,
  DISCLAIMER,
} from "@/config/app";

export const metadata: Metadata = {
  title: `${APP_NAME} — Understand Crypto Transactions in Plain English`,
  description: APP_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

const CAPABILITY_ICONS = {
  summary: Layers2,
  transfers: ArrowLeftRight,
  approvals: ShieldCheck,
  "wallet-impact": Wallet,
  gas: Fuel,
  shareable: Send,
} as const;

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
      <section className="animate-rise text-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <ChainIcon chain="ethereum" size="md" />
          <ChainIcon chain="base" size="md" />
        </div>
        <p className="mb-3 text-sm font-medium text-accent">
          Free · No wallet required · Ethereum & Base
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-tight">
          Understand any crypto transaction.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Paste an Ethereum or Base transaction hash and see what actually
          happened in plain English — transfers, swaps, approvals, wallet
          impact, and gas fees.
        </p>
      </section>

      <section
        className="animate-rise mt-10"
        style={{ animationDelay: "80ms" }}
        aria-label="Explain a transaction"
      >
        <TransactionSearch />
        <EmptyState />
      </section>

      <section
        id="features"
        className="animate-rise mt-20 scroll-mt-20"
        style={{ animationDelay: "120ms" }}
        aria-labelledby="features-heading"
      >
        <div className="text-center">
          <h2
            id="features-heading"
            className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            What Transaction Explainer shows
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Built for people who use crypto but do not want to decode logs,
            calldata, or explorer screens full of contract addresses.
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {APP_FEATURES.map((feature) => {
            const Icon =
              CAPABILITY_ICONS[feature.id as keyof typeof CAPABILITY_ICONS] ??
              Gift;
            return (
              <li
                key={feature.id}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="size-4" aria-hidden />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        id="how-it-works"
        className="animate-rise mt-20 scroll-mt-20"
        style={{ animationDelay: "160ms" }}
        aria-labelledby="how-heading"
      >
        <h2
          id="how-heading"
          className="text-center text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          How it works
        </h2>
        <ol className="mt-8 space-y-4">
          {[
            {
              step: "1",
              title: "Paste a transaction hash",
              body: "Choose Ethereum or Base, then enter a completed transaction hash starting with 0x.",
            },
            {
              step: "2",
              title: "We read the on-chain activity",
              body: "The app fetches the transaction and receipt, then parses token transfers, approvals, native value, and gas.",
            },
            {
              step: "3",
              title: "Get a plain-English explanation",
              body: "See a clear summary first, with wallet impact, transfers, permissions, and technical details available underneath.",
            },
          ].map((item) => (
            <li
              key={item.step}
              className="flex gap-4 rounded-2xl border border-border/70 bg-surface/50 p-4 sm:p-5"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                {item.step}
              </span>
              <div>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="about"
        className="animate-rise mt-20 scroll-mt-20"
        style={{ animationDelay: "200ms" }}
        aria-labelledby="about-heading"
      >
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <h2
            id="about-heading"
            className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            About {APP_NAME}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-[15px]">
            {APP_LONG_DESCRIPTION}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-[15px]">
            Blockchain explorers are powerful, but they are designed for
            technical users. {APP_NAME} focuses on one job: help anyone
            understand a finished transaction quickly, then optionally dig into
            the details.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-background/70 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Supported networks
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li className="flex items-center gap-2">
                  <ChainIcon chain="ethereum" size="sm" />
                  Ethereum Mainnet
                </li>
                <li className="flex items-center gap-2">
                  <ChainIcon chain="base" size="sm" />
                  Base Mainnet
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/70 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                What we do not do
              </h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-muted">
                <li>No wallet connection</li>
                <li>No transaction signing</li>
                <li>No safety or scam scoring</li>
                <li>No portfolio tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="animate-rise mt-20 scroll-mt-20"
        style={{ animationDelay: "240ms" }}
        aria-labelledby="faq-heading"
      >
        <div className="mb-8 flex items-center justify-center gap-2">
          <CircleHelp className="size-5 text-accent" aria-hidden />
          <h2
            id="faq-heading"
            className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            Frequently asked questions
          </h2>
        </div>
        <div className="space-y-3">
          {APP_FAQ.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-border bg-surface px-5 py-4 open:pb-5"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-3">
                  {item.question}
                  <span className="mt-0.5 text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-14 text-center text-xs leading-relaxed text-muted/80">
        {DISCLAIMER}
      </p>
    </div>
  );
}
