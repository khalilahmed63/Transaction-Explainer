import { cache } from "react";
import {
  type Hash,
  formatEther,
  formatGwei,
} from "viem";
import type {
  SupportedChain,
  TransactionExplanation,
} from "@/types/transaction";
import { formatTokenAmount } from "@/lib/utils/format";
import { getChainConfig } from "./chains";
import { getPublicClient } from "./clients";
import { classifyTransaction } from "./classify";
import { buildTransactionSummary } from "./explain";
import { getMethodId, parseApprovals } from "./parse-approvals";
import { getClaimAllocationForRecipient } from "./parse-claim";
import { parseTokenTransfers } from "./parse-transfers";
import { computeWalletImpact } from "./wallet-impact";

export class TransactionNotFoundError extends Error {
  constructor(chain: SupportedChain, hash: string) {
    super(`Transaction ${hash} was not found on ${chain}`);
    this.name = "TransactionNotFoundError";
  }
}

export class RpcRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RpcRequestError";
  }
}

/** Dedupes page + generateMetadata fetches within a single request. */
export const explainTransaction = cache(async function explainTransaction(
  chain: SupportedChain,
  hash: Hash,
): Promise<TransactionExplanation> {
  const client = getPublicClient(chain);
  const chainConfig = getChainConfig(chain);

  let tx;
  try {
    tx = await client.getTransaction({ hash });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/could not be found|not found/i.test(message)) {
      throw new TransactionNotFoundError(chain, hash);
    }
    throw new RpcRequestError(message);
  }

  if (!tx) {
    throw new TransactionNotFoundError(chain, hash);
  }

  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash });
  } catch (error) {
    // If the transaction is already mined, a missing receipt is an RPC failure —
    // not a pending transaction. Retry once, then surface a clear error.
    if (tx.blockNumber != null) {
      try {
        receipt = await client.getTransactionReceipt({ hash });
      } catch (retryError) {
        const message =
          retryError instanceof Error
            ? retryError.message
            : error instanceof Error
              ? error.message
              : "Failed to fetch transaction receipt";
        throw new RpcRequestError(message);
      }
    } else {
      receipt = null;
    }
  }

  if (!receipt && tx.blockNumber != null) {
    throw new RpcRequestError(
      "Transaction is confirmed but the receipt could not be loaded from the RPC provider.",
    );
  }

  const status: TransactionExplanation["status"] = !receipt
    ? "pending"
    : receipt.status === "success"
      ? "success"
      : "failed";

  let timestamp: number | undefined;
  let blockHash: string | undefined;

  if (receipt?.blockNumber != null) {
    try {
      const block = await client.getBlock({ blockNumber: receipt.blockNumber });
      timestamp = Number(block.timestamp);
      blockHash = block.hash ?? undefined;
    } catch {
      // Timestamp is optional enrichment
    }
  }

  // Only parse token movements for successful txs — reverted logs shouldn't be presented as completed
  const logs = status === "success" && receipt ? receipt.logs : [];

  const [tokenTransfers, approvals] = await Promise.all([
    status === "success"
      ? parseTokenTransfers(client, chain, logs)
      : Promise.resolve([]),
    status === "success"
      ? parseApprovals(client, chain, tx.to, tx.input, logs, tx.from)
      : Promise.resolve([]),
  ]);

  const walletImpact = computeWalletImpact({
    wallet: tx.from,
    tokenTransfers,
    nativeValueWei: status === "success" ? tx.value : 0n,
    to: tx.to,
    nativeSymbol: chainConfig.nativeSymbol,
    nativeName: chainConfig.nativeName,
  });

  const hasInputData = Boolean(tx.input && tx.input !== "0x");

  const classification = classifyTransaction({
    status,
    nativeValueWei: tx.value,
    to: tx.to,
    tokenTransfers,
    approvals,
    walletImpact,
    hasInputData,
    input: tx.input,
  });

  let claimDetails: TransactionExplanation["claimDetails"];
  if (
    status === "success" &&
    classification.type === "token_claim" &&
    walletImpact.received[0]
  ) {
    const received = walletImpact.received[0];
    if (received.tokenAddress && received.rawAmount) {
      const allocation = getClaimAllocationForRecipient({
        input: tx.input,
        recipient: tx.from,
        tokenAddress: received.tokenAddress,
        decimals: received.decimals,
      });

      if (
        allocation &&
        allocation.allocationRaw > BigInt(received.rawAmount)
      ) {
        claimDetails = {
          allocationAmount: allocation.allocationAmount,
          allocationSymbol: received.symbol,
          receivedAmount: received.amount,
          receivedSymbol: received.symbol,
          note: "Merkle claim contracts often send only the remaining unclaimed amount. The allocation can be larger than what moved in this transaction.",
        };
      }
    }
  }

  const gasUsed = receipt?.gasUsed;
  const effectiveGasPrice = receipt?.effectiveGasPrice ?? tx.gasPrice;
  let fee: string | undefined;
  if (gasUsed != null && effectiveGasPrice != null) {
    fee = formatTokenAmount(formatEther(gasUsed * effectiveGasPrice));
  }

  const nativeValue =
    tx.value > 0n
      ? {
          amount: formatTokenAmount(formatEther(tx.value)),
          symbol: chainConfig.nativeSymbol,
        }
      : undefined;

  const base: Omit<TransactionExplanation, "summary"> = {
    hash,
    chain,
    status,
    blockNumber: receipt?.blockNumber?.toString(),
    timestamp,
    from: tx.from,
    to: tx.to ?? undefined,
    transactionType: classification.type,
    confidence: classification.confidence,
    nativeValue,
    gas: {
      gasUsed: gasUsed?.toString(),
      effectiveGasPrice: effectiveGasPrice
        ? `${formatTokenAmount(formatGwei(effectiveGasPrice))} Gwei`
        : undefined,
      fee,
      symbol: chainConfig.nativeSymbol,
    },
    tokenTransfers,
    approvals,
    walletImpact,
    claimDetails,
    technical: {
      nonce: tx.nonce,
      blockHash,
      methodId: getMethodId(tx.input),
      input: tx.input && tx.input !== "0x" ? tx.input : undefined,
    },
    explorerUrl: chainConfig.explorerTxPath(hash),
  };

  const summary = buildTransactionSummary(base);

  return { ...base, summary };
});
