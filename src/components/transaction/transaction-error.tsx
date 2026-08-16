import Link from "next/link";
import { SearchX } from "lucide-react";
import type { SupportedChain } from "@/types/transaction";
import { getChainConfig } from "@/lib/blockchain/chains";
import { otherSupportedChains } from "@/lib/validation/transaction";
import { ChainIcon } from "@/components/ui/chain-icon";

type TransactionErrorProps = {
  title: string;
  message: string;
  chain?: SupportedChain;
  hash?: string;
  reasons?: string[];
};

export function TransactionError({
  title,
  message,
  chain,
  hash,
  reasons,
}: TransactionErrorProps) {
  const defaultReasons = chain
    ? [
        "the transaction hash is incorrect",
        `the transaction belongs to another network (not ${getChainConfig(chain).name})`,
        "the transaction hasn't been indexed yet",
      ]
    : undefined;

  const list = reasons ?? defaultReasons;
  const alternates =
    chain && hash ? otherSupportedChains(chain) : [];

  return (
    <div className="rounded-2xl border border-border bg-surface px-6 py-12 text-center sm:px-10">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-hover text-muted">
        <SearchX className="size-6" aria-hidden />
      </div>
      <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        {message}
      </p>
      {list && list.length > 0 && (
        <div className="mx-auto mt-6 max-w-sm text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Possible reasons
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {list.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
      {alternates.length > 0 && (
        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Try another network
          </p>
          {alternates.map((alt) => (
            <Link
              key={alt}
              href={`/tx/${alt}/${hash}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <ChainIcon chain={alt} size="sm" />
              Search on {getChainConfig(alt).name}
            </Link>
          ))}
        </div>
      )}
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        Try another transaction
      </Link>
    </div>
  );
}
