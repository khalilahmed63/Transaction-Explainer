import type { SupportedChain, TokenApproval } from "@/types/transaction";
import { AddressDisplay } from "@/components/ui/address";
import { TokenIcon } from "@/components/ui/token-icon";

type ApprovalCardProps = {
  approvals: TokenApproval[];
  chain: SupportedChain;
};

export function ApprovalCard({ approvals, chain }: ApprovalCardProps) {
  if (approvals.length === 0) return null;

  return (
    <section aria-labelledby="approvals-heading" className="animate-rise">
      <h2
        id="approvals-heading"
        className="mb-3 text-sm font-semibold text-foreground"
      >
        Token Permissions
      </h2>
      <ul className="space-y-3">
        {approvals.map((approval) => (
          <li
            key={`${approval.tokenAddress}-${approval.spender}`}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <TokenIcon
                symbol={approval.symbol}
                chain={chain}
                tokenAddress={approval.tokenAddress}
                iconUrl={approval.iconUrl}
                size="md"
              />
              <div>
                <p className="font-semibold text-foreground">{approval.symbol}</p>
                {approval.name && (
                  <p className="text-xs text-muted">{approval.name}</p>
                )}
              </div>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Spender
                </dt>
                <dd className="mt-1">
                  <AddressDisplay
                    address={approval.spender}
                    chain={chain}
                    label={approval.spenderLabel}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">
                  Allowance
                </dt>
                <dd className="mt-1 font-medium text-foreground">
                  {approval.isUnlimited
                    ? "Unlimited"
                    : `${approval.amount} ${approval.symbol}`}
                </dd>
              </div>
            </dl>
            {approval.isUnlimited && (
              <p className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
                This appears to be an unlimited token approval.
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
