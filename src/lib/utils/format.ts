/**
 * Format a token/native amount for display.
 * Preserves precision for very small values while trimming trailing zeros.
 */
export function formatTokenAmount(
  amount: string | number,
  options?: { maxDecimals?: number; minDecimals?: number },
): string {
  const maxDecimals = options?.maxDecimals ?? 8;
  const minDecimals = options?.minDecimals ?? 0;
  const num = typeof amount === "string" ? Number(amount) : amount;

  if (!Number.isFinite(num)) return "0";
  if (num === 0) return "0";

  const abs = Math.abs(num);

  // Very small values: keep scientific-ish precision without scientific notation
  if (abs > 0 && abs < 1e-6) {
    return num.toFixed(Math.min(18, maxDecimals + 6)).replace(/\.?0+$/, "");
  }

  const decimals =
    abs >= 1000 ? Math.min(2, maxDecimals) : abs >= 1 ? Math.min(4, maxDecimals) : maxDecimals;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp * 1000));
}

export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const d = Math.floor(seconds / 86400);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return formatDate(timestamp);
}
