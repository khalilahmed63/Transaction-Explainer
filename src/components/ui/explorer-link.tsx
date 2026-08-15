import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { SupportedChain } from "@/types/transaction";
import { getChainConfig } from "@/lib/blockchain/chains";
import { ChainIcon } from "@/components/ui/chain-icon";
import { cn } from "@/lib/utils/cn";

type ExplorerLinkProps = {
  chain: SupportedChain;
  hash: string;
  className?: string;
};

export function ExplorerLink({ chain, hash, className }: ExplorerLinkProps) {
  const config = getChainConfig(chain);

  return (
    <Link
      href={config.explorerTxPath(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        className,
      )}
    >
      <ChainIcon chain={chain} size="sm" />
      View on {config.explorerName}
      <ExternalLink className="size-3.5 text-muted" aria-hidden />
    </Link>
  );
}
