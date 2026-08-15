import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { AssetMovement, SupportedChain } from "@/types/transaction";
import { TokenIcon } from "@/components/ui/token-icon";
import { cn } from "@/lib/utils/cn";

type WalletImpactProps = {
  sent: AssetMovement[];
  received: AssetMovement[];
  chain: SupportedChain;
};

function MovementColumn({
  title,
  items,
  variant,
  chain,
}: {
  title: string;
  items: AssetMovement[];
  variant: "sent" | "received";
  chain: SupportedChain;
}) {
  const Icon = variant === "sent" ? ArrowUpRight : ArrowDownLeft;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-colors",
        variant === "sent"
          ? "border-danger/15 bg-danger/[0.03]"
          : "border-success/15 bg-success/[0.03]",
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full",
            variant === "sent" ? "bg-danger/10 text-danger" : "bg-success/10 text-success",
          )}
        >
          <Icon className="size-3.5" aria-hidden />
        </span>
        {title}
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">None</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {items.map((item) => (
            <li
              key={`${item.symbol}-${item.tokenAddress ?? "native"}`}
              className="flex items-center gap-3"
            >
              <TokenIcon
                key={`${item.symbol}-${item.tokenAddress ?? "native"}`}
                symbol={item.symbol}
                chain={chain}
                tokenAddress={item.tokenAddress}
                isNative={item.isNative}
                iconUrl={item.iconUrl}
                size="md"
              />
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  {variant === "sent" ? "−" : "+"}
                  {item.amount}{" "}
                  <span className="font-medium text-muted">{item.symbol}</span>
                </p>
                {item.name && (
                  <p className="truncate text-xs text-muted">{item.name}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WalletImpact({ sent, received, chain }: WalletImpactProps) {
  if (sent.length === 0 && received.length === 0) return null;

  return (
    <section aria-labelledby="wallet-impact-heading" className="animate-rise">
      <h2
        id="wallet-impact-heading"
        className="mb-3 text-sm font-semibold text-foreground"
      >
        Wallet Impact
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <MovementColumn title="Sent" items={sent} variant="sent" chain={chain} />
        <MovementColumn
          title="Received"
          items={received}
          variant="received"
          chain={chain}
        />
      </div>
    </section>
  );
}
