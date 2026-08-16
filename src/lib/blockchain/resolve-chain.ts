import type { Hash } from "viem";
import type { SupportedChain } from "@/types/transaction";
import { SUPPORTED_CHAINS } from "@/config/app";
import { getPublicClient } from "./clients";

/**
 * Lightweight existence check — does not parse the full explanation.
 */
export async function transactionExistsOnChain(
  chain: SupportedChain,
  hash: Hash,
): Promise<boolean> {
  try {
    const client = getPublicClient(chain);
    const tx = await client.getTransaction({ hash });
    return Boolean(tx);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/could not be found|not found/i.test(message)) {
      return false;
    }
    // Treat RPC failures as "unknown" — do not claim another chain.
    throw error;
  }
}

/**
 * If the hash is missing on `preferred`, find another supported chain that has it.
 */
export async function findAlternateChain(
  preferred: SupportedChain,
  hash: Hash,
): Promise<SupportedChain | null> {
  const candidates = SUPPORTED_CHAINS.filter((c) => c !== preferred);

  for (const chain of candidates) {
    try {
      if (await transactionExistsOnChain(chain, hash)) {
        return chain;
      }
    } catch {
      // Skip chains that error (RPC down) and keep looking / fall through.
    }
  }

  return null;
}
