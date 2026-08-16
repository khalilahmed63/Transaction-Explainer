import { isHash } from "viem";
import type { SupportedChain } from "@/types/transaction";
import { SUPPORTED_CHAINS } from "@/config/app";

const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;
const TX_HASH_IN_TEXT = /0x[a-fA-F0-9]{64}/;

export function isValidTxHash(hash: string): boolean {
  const trimmed = hash.trim();
  return TX_HASH_REGEX.test(trimmed) && isHash(trimmed);
}

export function isSupportedChain(value: string): value is SupportedChain {
  return SUPPORTED_CHAINS.includes(value as SupportedChain);
}

export function normalizeHash(hash: string): string {
  return hash.trim().toLowerCase();
}

/**
 * Accept a raw hash or an explorer URL / pasted text that contains one.
 */
export function extractTxHash(input: string): string | null {
  const trimmed = input.trim();
  if (isValidTxHash(trimmed)) return normalizeHash(trimmed);

  const match = trimmed.match(TX_HASH_IN_TEXT);
  if (match && isValidTxHash(match[0])) return normalizeHash(match[0]);

  return null;
}

/**
 * Infer network from pasted explorer links.
 * Returns null when there is no clear hint — the user's selected chain stays.
 */
export function detectChainHintFromInput(input: string): SupportedChain | null {
  const lower = input.trim().toLowerCase();
  if (!lower) return null;

  if (
    lower.includes("arbiscan") ||
    lower.includes("/arbitrum/") ||
    lower.includes("chain=arbitrum")
  ) {
    return "arbitrum";
  }

  if (
    lower.includes("polygonscan") ||
    lower.includes("/polygon/") ||
    lower.includes("chain=polygon")
  ) {
    return "polygon";
  }

  if (
    lower.includes("bscscan") ||
    lower.includes("/bsc/") ||
    lower.includes("chain=bsc") ||
    lower.includes("bnbchain")
  ) {
    return "bsc";
  }

  if (
    lower.includes("optimistic.etherscan") ||
    lower.includes("opscan") ||
    lower.includes("/optimism/") ||
    lower.includes("chain=optimism")
  ) {
    return "optimism";
  }

  if (
    lower.includes("snowtrace") ||
    lower.includes("snowscan") ||
    lower.includes("/avalanche/") ||
    lower.includes("chain=avalanche") ||
    lower.includes("avax.network")
  ) {
    return "avalanche";
  }

  if (
    lower.includes("basescan") ||
    lower.includes("base.org/tx") ||
    lower.includes("/base/") ||
    lower.includes("chain=base")
  ) {
    return "base";
  }

  if (
    lower.includes("etherscan") ||
    lower.includes("/ethereum/") ||
    lower.includes("chain=ethereum") ||
    lower.includes("chain=eth")
  ) {
    return "ethereum";
  }

  return null;
}

export function getHashValidationError(hash: string): string | null {
  const trimmed = hash.trim();
  if (!trimmed) return null;
  if (extractTxHash(trimmed)) return null;
  if (!trimmed.startsWith("0x") && !trimmed.includes("0x")) {
    return "That doesn't look like a valid transaction hash.";
  }
  return "That doesn't look like a valid transaction hash.";
}

export function otherSupportedChains(
  chain: SupportedChain,
): SupportedChain[] {
  return SUPPORTED_CHAINS.filter((c) => c !== chain);
}
