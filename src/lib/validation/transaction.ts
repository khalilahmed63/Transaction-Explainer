import { isHash } from "viem";
import type { SupportedChain } from "@/types/transaction";
import { SUPPORTED_CHAINS } from "@/config/app";

const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

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

export function getHashValidationError(hash: string): string | null {
  const trimmed = hash.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("0x")) {
    return "That doesn't look like a valid transaction hash.";
  }
  if (!isValidTxHash(trimmed)) {
    return "That doesn't look like a valid transaction hash.";
  }
  return null;
}
