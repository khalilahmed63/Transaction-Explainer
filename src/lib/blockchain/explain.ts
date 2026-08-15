import type {
  ClassificationConfidence,
  TokenApproval,
  TransactionExplanation,
  TransactionType,
} from "@/types/transaction";
import { formatAddress } from "@/lib/utils/format";
import { getAddressLabel } from "./known-addresses";

type ExplainInput = Pick<
  TransactionExplanation,
  | "chain"
  | "status"
  | "from"
  | "to"
  | "transactionType"
  | "confidence"
  | "nativeValue"
  | "tokenTransfers"
  | "approvals"
  | "walletImpact"
  | "claimDetails"
>;

function boldAmount(amount: string, symbol: string): string {
  return `**${amount} ${symbol}**`;
}

function describeAddress(
  chain: ExplainInput["chain"],
  address: string | undefined,
): string {
  if (!address) return "another wallet";
  const label = getAddressLabel(chain, address);
  if (label) return label;
  return formatAddress(address);
}

export function buildTransactionSummary(tx: ExplainInput): string {
  if (tx.status === "failed") {
    return "This transaction was submitted to the network but did not complete successfully.";
  }

  const { sent, received } = tx.walletImpact;
  const uncertain =
    tx.confidence === "low" || tx.confidence === "medium"
      ? soften(tx.transactionType, tx.confidence)
      : null;

  switch (tx.transactionType) {
    case "native_transfer": {
      const amount = tx.nativeValue?.amount ?? sent[0]?.amount ?? "0";
      const symbol = tx.nativeValue?.symbol ?? "ETH";
      return `You sent ${boldAmount(amount, symbol)} to ${describeAddress(tx.chain, tx.to)}.`;
    }

    case "token_transfer": {
      if (sent.length > 0) {
        const asset = sent[0];
        // Prefer the transfer recipient over contract `to`
        const recipient =
          tx.tokenTransfers.find(
            (t) => t.from.toLowerCase() === tx.from.toLowerCase(),
          )?.to ?? tx.to;
        return `You sent ${boldAmount(asset.amount, asset.symbol)} to ${describeAddress(tx.chain, recipient)}.`;
      }
      if (received.length > 0) {
        const asset = received[0];
        return `You received ${boldAmount(asset.amount, asset.symbol)}.`;
      }
      return "You transferred a token to another wallet.";
    }

    case "token_approval": {
      return buildApprovalSummary(tx.chain, tx.approvals[0]);
    }

    case "token_swap": {
      const fromAsset = sent[0];
      const toAsset = received[0];
      if (fromAsset && toAsset) {
        const prefix =
          uncertain || tx.confidence !== "high"
            ? "This transaction appears to be a token swap where you sent"
            : "You swapped approximately";
        if (prefix.startsWith("This")) {
          return `${prefix} ${boldAmount(fromAsset.amount, fromAsset.symbol)} and received ${boldAmount(toAsset.amount, toAsset.symbol)}.`;
        }
        return `${prefix} ${boldAmount(fromAsset.amount, fromAsset.symbol)} for ${boldAmount(toAsset.amount, toAsset.symbol)}.`;
      }
      return "This transaction appears to be a token swap.";
    }

    case "token_claim": {
      const asset = received[0];
      const source = describeAddress(tx.chain, tx.to);
      if (asset) {
        // Always describe what the wallet actually received in THIS transaction.
        if (
          tx.claimDetails &&
          tx.claimDetails.allocationAmount !== tx.claimDetails.receivedAmount
        ) {
          return `You received ${boldAmount(asset.amount, asset.symbol)} from ${source}. This was the remaining amount from a ${boldAmount(tx.claimDetails.allocationAmount, tx.claimDetails.allocationSymbol)} claim allocation.`;
        }
        if (tx.confidence === "high") {
          return `You claimed ${boldAmount(asset.amount, asset.symbol)} from ${source}.`;
        }
        return `You received ${boldAmount(asset.amount, asset.symbol)} from ${source}. This appears to be a token claim or reward.`;
      }
      return `You claimed tokens from ${source}.`;
    }

    case "contract_interaction": {
      if (sent.length > 0 && received.length > 0) {
        return `You interacted with a smart contract, sending ${boldAmount(sent[0].amount, sent[0].symbol)} and receiving ${boldAmount(received[0].amount, received[0].symbol)}.`;
      }
      if (received.length > 0) {
        return `You interacted with a smart contract and received ${boldAmount(received[0].amount, received[0].symbol)}.`;
      }
      if (sent.length > 0) {
        return `You interacted with a smart contract and sent ${boldAmount(sent[0].amount, sent[0].symbol)}.`;
      }
      if (tx.approvals.length > 0) {
        return buildApprovalSummary(tx.chain, tx.approvals[0]);
      }
      return "You interacted with a smart contract.";
    }

    default:
      return "We analyzed this transaction but could not fully classify what happened.";
  }
}

function buildApprovalSummary(
  chain: ExplainInput["chain"],
  approval: TokenApproval | undefined,
): string {
  if (!approval) {
    return "You approved a contract to spend tokens from your wallet.";
  }

  const spender = approval.spenderLabel ?? formatAddress(approval.spender);

  if (approval.isUnlimited) {
    return `You gave **${spender}** permission to spend an unlimited amount of your **${approval.symbol}**. This appears to be an unlimited token approval.`;
  }

  return `You gave **${spender}** permission to spend up to ${boldAmount(approval.amount, approval.symbol)} from your wallet.`;
}

function soften(
  type: TransactionType,
  confidence: ClassificationConfidence,
): boolean {
  return confidence !== "high" && type === "token_swap";
}

/** Render summary markdown-lite (**bold**) segments for React */
export function parseSummarySegments(
  summary: string,
): Array<{ text: string; bold: boolean }> {
  const parts = summary.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return { text: part.slice(2, -2), bold: true };
    }
    return { text: part, bold: false };
  });
}
