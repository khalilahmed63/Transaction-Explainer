import { Fuel } from "lucide-react";
import type { SupportedChain } from "@/types/transaction";
import { TokenIcon } from "@/components/ui/token-icon";

type GasFeeCardProps = {
  fee?: string;
  symbol?: string;
  chain?: SupportedChain;
};

export function GasFeeCard({
  fee,
  symbol = "ETH",
  chain = "ethereum",
}: GasFeeCardProps) {
  if (!fee) return null;

  return (
    <section
      className="animate-rise flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4"
      aria-labelledby="gas-heading"
    >
      <div className="flex items-center gap-3">
        <span className="relative">
          <TokenIcon symbol="ETH" chain={chain} isNative size="md" />
          <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-surface ring-1 ring-border text-muted">
            <Fuel className="size-2.5" aria-hidden />
          </span>
        </span>
        <div>
          <h2 id="gas-heading" className="text-sm font-medium text-foreground">
            Network Fee
          </h2>
          <p className="text-xs text-muted">Paid to process this transaction</p>
        </div>
      </div>
      <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
        {fee} {symbol}
      </p>
    </section>
  );
}
