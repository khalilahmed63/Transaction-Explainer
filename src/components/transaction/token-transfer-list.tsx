import { ArrowDown } from "lucide-react";
import type { SupportedChain, TokenTransfer } from "@/types/transaction";
import { AddressDisplay } from "@/components/ui/address";
import { TokenIcon } from "@/components/ui/token-icon";

type TokenTransferListProps = {
  transfers: TokenTransfer[];
  chain: SupportedChain;
};

export function TokenTransferList({ transfers, chain }: TokenTransferListProps) {
  if (transfers.length === 0) return null;

  return (
    <section aria-labelledby="transfers-heading" className="animate-rise">
      <h2
        id="transfers-heading"
        className="mb-3 text-sm font-semibold text-foreground"
      >
        Token Transfers
      </h2>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {transfers.map((transfer) => (
          <li
            key={`${transfer.logIndex}-${transfer.tokenAddress}-${transfer.from}-${transfer.to}`}
            className="p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <TokenIcon
                symbol={transfer.symbol}
                chain={chain}
                tokenAddress={transfer.tokenAddress}
                iconUrl={transfer.iconUrl}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {transfer.symbol}
                      {transfer.name && (
                        <span className="ml-2 text-sm font-normal text-muted">
                          {transfer.name}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-lg font-medium tracking-tight tabular-nums">
                      {transfer.amount} {transfer.symbol}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-background/70 px-3.5 py-3">
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-10 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted">
                        From
                      </span>
                      <AddressDisplay
                        address={transfer.from}
                        chain={chain}
                        label={transfer.fromLabel}
                      />
                    </div>
                    <div className="flex items-center gap-2 pl-[2.65rem]">
                      <ArrowDown className="size-3.5 text-muted" aria-hidden />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-10 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted">
                        To
                      </span>
                      <AddressDisplay
                        address={transfer.to}
                        chain={chain}
                        label={transfer.toLabel}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
