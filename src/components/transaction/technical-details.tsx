"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import type { SupportedChain, TransactionExplanation } from "@/types/transaction";
import { AddressDisplay } from "@/components/ui/address";
import { CopyButton } from "@/components/ui/copy-button";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type TechnicalDetailsProps = {
  tx: TransactionExplanation;
};

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd className="min-w-0 break-all text-sm text-foreground sm:text-right">
        {children}
      </dd>
    </div>
  );
}

export function TechnicalDetails({ tx }: TechnicalDetailsProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const chain = tx.chain as SupportedChain;

  return (
    <section className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
      >
        Technical Details
        <ChevronDown
          className={cn(
            "size-4 text-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <dl id={panelId} className="border-t border-border px-5 pb-2">
          <Row label="Transaction Hash">
            <span className="inline-flex items-center gap-1 font-mono">
              {tx.hash}
              <CopyButton value={tx.hash} label="Copy hash" />
            </span>
          </Row>
          {tx.blockNumber && (
            <Row label="Block">{tx.blockNumber}</Row>
          )}
          {tx.timestamp && (
            <Row label="Timestamp">{formatDate(tx.timestamp)}</Row>
          )}
          <Row label="From">
            <AddressDisplay address={tx.from} chain={chain} />
          </Row>
          {tx.to && (
            <Row label="To">
              <AddressDisplay address={tx.to} chain={chain} />
            </Row>
          )}
          {tx.nativeValue && (
            <Row label="Value">
              {tx.nativeValue.amount} {tx.nativeValue.symbol}
            </Row>
          )}
          {tx.gas.gasUsed && <Row label="Gas Used">{tx.gas.gasUsed}</Row>}
          {tx.gas.effectiveGasPrice && (
            <Row label="Gas Price">{tx.gas.effectiveGasPrice}</Row>
          )}
          {tx.gas.fee && (
            <Row label="Transaction Fee">
              {tx.gas.fee} {tx.gas.symbol}
            </Row>
          )}
          {tx.technical.nonce != null && (
            <Row label="Nonce">{tx.technical.nonce}</Row>
          )}
          {tx.technical.methodId && (
            <Row label="Method ID">
              <span className="font-mono">{tx.technical.methodId}</span>
            </Row>
          )}
          {tx.technical.blockHash && (
            <Row label="Block Hash">
              <span className="font-mono text-xs">{tx.technical.blockHash}</span>
            </Row>
          )}
        </dl>
      )}
    </section>
  );
}
