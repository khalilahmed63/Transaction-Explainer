import Link from "next/link";
import { EXAMPLE_TRANSACTIONS } from "@/config/app";
import type { SupportedChain } from "@/types/transaction";

export function EmptyState() {
  const examples = (
    Object.entries(EXAMPLE_TRANSACTIONS) as [
      SupportedChain,
      { hash: string; label: string },
    ][]
  ).filter(([, value]) => Boolean(value?.hash));

  if (examples.length === 0) return null;

  return (
    <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface/40 px-5 py-6 text-center">
      <h2 className="text-sm font-semibold text-foreground">Try an example</h2>
      <p className="mt-1 text-sm text-muted">
        Explore a real transaction to see how explanations look.
      </p>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {examples.map(([chain, example]) => (
          <li key={example.hash}>
            <Link
              href={`/tx/${chain}/${example.hash}`}
              className="inline-flex items-center rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {example.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
