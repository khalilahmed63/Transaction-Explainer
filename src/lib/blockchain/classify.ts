import type { Hex } from "viem";
import type {
  ClassificationConfidence,
  TokenApproval,
  TokenTransfer,
  TransactionType,
} from "@/types/transaction";
import type { AssetMovement } from "@/types/transaction";
import { isClaimMethod } from "./parse-claim";

export type ClassificationInput = {
  status: "success" | "failed" | "pending";
  nativeValueWei: bigint;
  to: string | null | undefined;
  tokenTransfers: TokenTransfer[];
  approvals: TokenApproval[];
  walletImpact: {
    sent: AssetMovement[];
    received: AssetMovement[];
  };
  hasInputData: boolean;
  input?: Hex;
};

export type ClassificationResult = {
  type: TransactionType;
  confidence: ClassificationConfidence;
};

export function classifyTransaction(
  input: ClassificationInput,
): ClassificationResult {
  if (input.status === "failed") {
    return { type: "unknown", confidence: "high" };
  }

  const { sent, received } = input.walletImpact;
  const hasNativeOut = input.nativeValueWei > BigInt(0);
  const hasTokenTransfers = input.tokenTransfers.length > 0;
  const hasApprovals = input.approvals.length > 0;
  const looksLikeClaim = isClaimMethod(input.input);

  // Token swap: something left wallet AND something entered wallet
  if (sent.length >= 1 && received.length >= 1) {
    const sentSymbols = new Set(sent.map((s) => s.symbol.toUpperCase()));
    const receivedSymbols = new Set(received.map((r) => r.symbol.toUpperCase()));
    const overlap = [...sentSymbols].some((s) => receivedSymbols.has(s));

    if (!overlap || sentSymbols.size > 1 || receivedSymbols.size > 1) {
      return { type: "token_swap", confidence: overlap ? "medium" : "high" };
    }
  }

  // Pure approval (no meaningful transfers)
  if (hasApprovals && !hasTokenTransfers && !hasNativeOut) {
    return { type: "token_approval", confidence: "high" };
  }

  // Claim / bonus: tokens entered the wallet via a claim-style call
  if (received.length > 0 && sent.length === 0 && !hasNativeOut) {
    if (looksLikeClaim) {
      return { type: "token_claim", confidence: "high" };
    }
    if (input.hasInputData) {
      // User triggered a contract and only received tokens — likely claim/airdrop pull
      return { type: "token_claim", confidence: "medium" };
    }
    return { type: "token_transfer", confidence: "medium" };
  }

  // Native ETH transfer to an EOA-like simple transfer (value > 0, no token movement)
  if (hasNativeOut && !hasTokenTransfers && !hasApprovals) {
    if (!input.hasInputData) {
      return { type: "native_transfer", confidence: "high" };
    }
    return { type: "contract_interaction", confidence: "medium" };
  }

  // Single-direction ERC-20 transfer from wallet
  if (
    hasTokenTransfers &&
    sent.length === 1 &&
    received.length === 0 &&
    !hasApprovals
  ) {
    return { type: "token_transfer", confidence: "high" };
  }

  if (input.hasInputData || input.to) {
    return { type: "contract_interaction", confidence: "medium" };
  }

  return { type: "unknown", confidence: "low" };
}
