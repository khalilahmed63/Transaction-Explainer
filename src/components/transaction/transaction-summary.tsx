import { parseSummarySegments } from "@/lib/blockchain/explain";
import type { TransactionType } from "@/types/transaction";
import { TransactionTypeIcon } from "@/components/transaction/transaction-type-badge";
import { cn } from "@/lib/utils/cn";

type TransactionSummaryProps = {
  summary: string;
  title?: string;
  transactionType?: TransactionType;
  className?: string;
};

export function TransactionSummary({
  summary,
  title = "What happened?",
  transactionType,
  className,
}: TransactionSummaryProps) {
  const segments = parseSummarySegments(summary);

  return (
    <section
      className={cn(
        "animate-rise rounded-2xl border border-border bg-surface p-6 shadow-sm shadow-black/[0.03] sm:p-8",
        className,
      )}
      aria-labelledby="summary-heading"
    >
      <div className="flex items-start gap-4">
        {transactionType && (
          <TransactionTypeIcon type={transactionType} className="mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <h2
            id="summary-heading"
            className="text-xs font-medium uppercase tracking-wider text-muted"
          >
            {title}
          </h2>
          <p className="mt-3 text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl">
            {segments.map((segment, i) =>
              segment.bold ? (
                <strong
                  key={i}
                  className="font-semibold text-accent dark:text-accent"
                >
                  {segment.text}
                </strong>
              ) : (
                <span key={i}>{segment.text}</span>
              ),
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
