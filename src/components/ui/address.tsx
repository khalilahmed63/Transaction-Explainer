import Link from "next/link";
import type { SupportedChain } from "@/types/transaction";
import { getChainConfig } from "@/lib/blockchain/chains";
import { formatAddress } from "@/lib/utils/format";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils/cn";

type AddressProps = {
  address: string;
  chain: SupportedChain;
  label?: string;
  showCopy?: boolean;
  showExplorer?: boolean;
  className?: string;
};

export function AddressDisplay({
  address,
  chain,
  label,
  showCopy = true,
  showExplorer = true,
  className,
}: AddressProps) {
  const config = getChainConfig(chain);
  const display = label ?? formatAddress(address);

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span
        className={cn(
          "font-mono text-sm",
          label ? "font-sans font-medium" : undefined,
        )}
        title={address}
      >
        {display}
      </span>
      {label && (
        <span className="font-mono text-xs text-muted" title={address}>
          {formatAddress(address)}
        </span>
      )}
      {showCopy && <CopyButton value={address} label="Copy address" />}
      {showExplorer && (
        <Link
          href={config.explorerAddressPath(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted underline-offset-2 hover:text-accent hover:underline"
          aria-label={`View address on ${config.explorerName}`}
        >
          ↗
        </Link>
      )}
    </span>
  );
}
