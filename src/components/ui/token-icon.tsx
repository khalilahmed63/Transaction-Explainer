"use client";

import { useMemo, useState } from "react";
import type { SupportedChain } from "@/types/transaction";
import {
  getKnownIconUrl,
  getTokenFallbackColor,
  getTokenIconCandidates,
} from "@/lib/tokens/icons";
import { ChainIcon } from "@/components/ui/chain-icon";
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

const NATIVE_SYMBOLS = new Set(["ETH", "POL", "BNB", "AVAX"]);

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
    (NATIVE_SYMBOLS.has(symbol.toUpperCase()) && !tokenAddress);

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
  const nativeIcon = native
    ? getKnownIconUrl(chain, undefined, symbol)
    : null;

  if (native) {
    if (nativeIcon) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={nativeIcon}
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
          title={symbol}
        />
      );
    }

    const chainSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "md";
    return <ChainIcon chain={chain} size={chainSize} className={className} />;
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
