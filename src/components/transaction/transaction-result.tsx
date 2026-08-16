import type { TransactionExplanation } from "@/types/transaction";
import { getChainConfig } from "@/lib/blockchain/chains";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import { DISCLAIMER } from "@/config/app";
import { TransactionStatusBadge } from "@/components/transaction/transaction-status";
import { TransactionTypeBadge } from "@/components/transaction/transaction-type-badge";
import { TransactionSummary } from "@/components/transaction/transaction-summary";
import { WalletImpact } from "@/components/transaction/wallet-impact";
import { TokenTransferList } from "@/components/transaction/token-transfer-list";
import { ApprovalCard } from "@/components/transaction/approval-card";
import { ClaimDetailsCard } from "@/components/transaction/claim-details-card";
import { GasFeeCard } from "@/components/transaction/gas-fee-card";
import { TechnicalDetails } from "@/components/transaction/technical-details";
import { ExplorerLink } from "@/components/ui/explorer-link";
import { CopyButton } from "@/components/ui/copy-button";
import { ChainIcon } from "@/components/ui/chain-icon";

type TransactionResultProps = {
  tx: TransactionExplanation;
};

export function TransactionResult({ tx }: TransactionResultProps) {
  const chainConfig = getChainConfig(tx.chain);
  const isFailed = tx.status === "failed";

  return (
    <article className="space-y-8">
      <header className="animate-rise space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-sm font-medium text-foreground">
            <ChainIcon chain={tx.chain} size="sm" />
            {chainConfig.name}
          </span>
          <TransactionStatusBadge status={tx.status} />
          {!isFailed && <TransactionTypeBadge type={tx.transactionType} />}
        </div>

        {tx.timestamp && (
          <p className="text-sm text-muted">
            {formatDate(tx.timestamp)}
            <span className="mx-1.5 text-border">·</span>
            {formatRelativeTime(tx.timestamp)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border/70 bg-surface/60 px-3 py-2 font-mono text-xs text-muted break-all">
          <span className="min-w-0 flex-1">{tx.hash}</span>
          <CopyButton value={tx.hash} label="Copy transaction hash" />
        </div>
      </header>

      {isFailed ? (
        <TransactionSummary
          title="Transaction Failed"
          summary={tx.summary}
          transactionType="unknown"
        />
      ) : (
        <TransactionSummary
          summary={tx.summary}
          transactionType={tx.transactionType}
        />
      )}

      {!isFailed && (
        <>
          <WalletImpact
            sent={tx.walletImpact.sent}
            received={tx.walletImpact.received}
            chain={tx.chain}
          />
          {tx.claimDetails && (
            <ClaimDetailsCard
              details={tx.claimDetails}
              chain={tx.chain}
              tokenAddress={tx.walletImpact.received[0]?.tokenAddress}
              iconUrl={tx.walletImpact.received[0]?.iconUrl}
            />
          )}
        </>
      )}

      {isFailed &&
        tx.tokenTransfers.length === 0 &&
        tx.walletImpact.sent.length === 0 && (
          <p className="text-sm text-muted">
            No token transfers completed because this transaction reverted.
          </p>
        )}

      <GasFeeCard fee={tx.gas.fee} symbol={tx.gas.symbol} chain={tx.chain} />

      {!isFailed && (
        <>
          <TokenTransferList transfers={tx.tokenTransfers} chain={tx.chain} />
          <ApprovalCard approvals={tx.approvals} chain={tx.chain} />
        </>
      )}

      <TechnicalDetails tx={tx} />

      <div className="flex flex-wrap items-center gap-3">
        <ExplorerLink chain={tx.chain} hash={tx.hash} />
      </div>

      <p className="text-xs leading-relaxed text-muted/80">{DISCLAIMER}</p>
    </article>
  );
}
