import type { TransactionSource } from "./events";

const SOURCE_KEY = "tx_explainer_source";

function getSessionStorage(): Storage | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

/** Remember how the user initiated the next transaction view (client-only). */
export function setTransactionSource(source: TransactionSource): void {
  try {
    getSessionStorage()?.setItem(SOURCE_KEY, source);
  } catch {
    // ignore storage failures
  }
}

/**
 * Read and clear the pending source. Defaults to direct_link for shared URLs
 * and cold loads with no prior homepage interaction.
 */
export function consumeTransactionSource(): TransactionSource {
  try {
    const storage = getSessionStorage();
    if (!storage) return "direct_link";
    const value = storage.getItem(SOURCE_KEY);
    storage.removeItem(SOURCE_KEY);
    if (value === "manual" || value === "example" || value === "direct_link") {
      return value;
    }
  } catch {
    // ignore
  }
  return "direct_link";
}
