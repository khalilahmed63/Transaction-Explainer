import { Gift, Info } from "lucide-react";
import type { TransactionExplanation } from "@/types/transaction";
import { TokenIcon } from "@/components/ui/token-icon";

type ClaimDetailsCardProps = {
  details: NonNullable<TransactionExplanation["claimDetails"]>;
  chain: TransactionExplanation["chain"];
  tokenAddress?: string;
  iconUrl?: string;
};

export function ClaimDetailsCard({
  details,
  chain,
  tokenAddress,
  iconUrl,
}: ClaimDetailsCardProps) {
  return (
    <section
      className="animate-rise rounded-2xl border border-accent/20 bg-accent/[0.04] p-5"
      aria-labelledby="claim-details-heading"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Gift className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="claim-details-heading"
            className="text-sm font-semibold text-foreground"
          >
            Claim Details
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <TokenIcon
              symbol={details.receivedSymbol}
              chain={chain}
              tokenAddress={tokenAddress}
              iconUrl={iconUrl}
              size="md"
            />
            <div className="text-sm">
              <p className="text-foreground">
                <span className="text-muted">Received this transaction:</span>{" "}
                <span className="font-semibold">
                  {details.receivedAmount} {details.receivedSymbol}
                </span>
              </p>
              <p className="mt-1 text-foreground">
                <span className="text-muted">Full claim allocation:</span>{" "}
                <span className="font-semibold">
                  {details.allocationAmount} {details.allocationSymbol}
                </span>
              </p>
            </div>
          </div>
          <p className="mt-3 flex gap-2 text-xs leading-relaxed text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {details.note}
          </p>
        </div>
      </div>
    </section>
  );
}
