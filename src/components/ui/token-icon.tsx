"use client";

import { useMemo, useState } from "react";
import type { SupportedChain } from "@/types/transaction";
import {
  getTokenFallbackColor,
  getTokenIconCandidates,
} from "@/lib/tokens/icons";
import { cn } from "@/lib/utils/cn";

type TokenIconProps = {
  symbol: string;
  chain?: SupportedChain;
  tokenAddress?: string;
  isNative?: boolean;
  iconUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
} as const;

function EthGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 1.75 5.75 12.25l6.25 2.7 6.25-2.7L12 1.75Z" opacity="0.7" />
      <path d="M12 16.15 5.75 13.25 12 22.25l6.25-9-6.25 2.9Z" />
    </svg>
  );
}

export function TokenIcon({
  symbol,
  chain = "ethereum",
  tokenAddress,
  isNative,
  iconUrl,
  size = "md",
  className,
}: TokenIconProps) {
  const native =
    Boolean(isNative) ||
    (symbol.toUpperCase() === "ETH" && !tokenAddress);

  const candidates = useMemo(
    () =>
      native
        ? []
        : getTokenIconCandidates(chain, tokenAddress, symbol, iconUrl),
    [native, chain, tokenAddress, symbol, iconUrl],
  );

  const [index, setIndex] = useState(0);
  const letter = (symbol || "?").slice(0, 1).toUpperCase();
  const currentUrl = candidates[index];

  if (native) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-[#627EEA] text-white ring-1 ring-black/5",
          SIZES[size],
          className,
        )}
        title={symbol}
        aria-hidden
      >
        <EthGlyph className="size-[55%]" />
      </span>
    );
  }

  if (currentUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={currentUrl}
        src={currentUrl}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={cn(
          "inline-block shrink-0 rounded-full bg-surface ring-1 ring-border object-cover",
          SIZES[size],
          className,
        )}
        onError={() => setIndex((i) => i + 1)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-1 ring-black/5",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: getTokenFallbackColor(symbol) }}
      title={symbol}
      aria-hidden
    >
      {letter}
    </span>
  );
}
