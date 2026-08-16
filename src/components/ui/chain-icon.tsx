import type { SupportedChain } from "@/types/transaction";
import { cn } from "@/lib/utils/cn";

type ChainIconProps = {
  chain: SupportedChain;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
} as const;

const STYLES: Record<
  SupportedChain,
  { bg: string; shadow: string; glyph: "eth" | "base" | "arb" | "pol" | "bnb" | "op" | "avax" }
> = {
  ethereum: {
    bg: "bg-[#627EEA]",
    shadow: "shadow-[#627EEA]/25",
    glyph: "eth",
  },
  base: {
    bg: "bg-[#0052FF]",
    shadow: "shadow-[#0052FF]/25",
    glyph: "base",
  },
  arbitrum: {
    bg: "bg-[#12AAFF]",
    shadow: "shadow-[#12AAFF]/25",
    glyph: "arb",
  },
  polygon: {
    bg: "bg-[#8247E5]",
    shadow: "shadow-[#8247E5]/25",
    glyph: "pol",
  },
  bsc: {
    bg: "bg-[#F0B90B]",
    shadow: "shadow-[#F0B90B]/25",
    glyph: "bnb",
  },
  optimism: {
    bg: "bg-[#FF0420]",
    shadow: "shadow-[#FF0420]/25",
    glyph: "op",
  },
  avalanche: {
    bg: "bg-[#E84142]",
    shadow: "shadow-[#E84142]/25",
    glyph: "avax",
  },
};

function Glyph({
  kind,
}: {
  kind: (typeof STYLES)[SupportedChain]["glyph"];
}) {
  switch (kind) {
    case "eth":
      return (
        <svg viewBox="0 0 24 24" className="size-[58%]" fill="currentColor">
          <path d="M12 1.75 5.75 12.25l6.25 2.7 6.25-2.7L12 1.75Z" opacity="0.7" />
          <path d="M12 16.15 5.75 13.25 12 22.25l6.25-9-6.25 2.9Z" />
          <path d="M12 1.75v11.2l6.25-.7L12 1.75Z" opacity="0.85" />
        </svg>
      );
    case "base":
      return (
        <svg viewBox="0 0 24 24" className="size-[52%]" fill="currentColor">
          <path d="M12.15 3.2c-2.2 2.7-3.7 6.35-3.95 10.4h7.9c-.25-4.05-1.75-7.7-3.95-10.4Z" />
          <path
            d="M8.2 14.85c.35 2.9 1.55 5.45 3.3 7.15.1.1.25.1.35 0 1.75-1.7 2.95-4.25 3.3-7.15H8.2Z"
            opacity="0.75"
          />
        </svg>
      );
    case "arb":
      return (
        <svg viewBox="0 0 24 24" className="size-[55%]" fill="currentColor">
          <path d="M12 3.5 4.5 18h3.2l1.3-2.6h6l1.3 2.6H19.5L12 3.5Zm0 4.2 2.1 4.2H9.9L12 7.7Z" />
        </svg>
      );
    case "pol":
      return (
        <svg viewBox="0 0 24 24" className="size-[55%]" fill="currentColor">
          <path d="M7.2 8.4c.4-.7 1.1-1.1 1.9-1.1h1.3v7.8c0 .4.3.7.7.7h1.8c.4 0 .7-.3.7-.7V7.3h1.3c.8 0 1.5.4 1.9 1.1l2.7 4.7c.4.7.4 1.5 0 2.2L16.5 19c-.4.7-1.1 1.1-1.9 1.1H7.8c-.8 0-1.5-.4-1.9-1.1L3.2 14.3c-.4-.7-.4-1.5 0-2.2L7.2 8.4Z" />
        </svg>
      );
    case "bnb":
      return (
        <svg viewBox="0 0 24 24" className="size-[55%]" fill="currentColor">
          <path d="M12 3.5 14.2 5.7 12 7.9 9.8 5.7 12 3.5Zm-5.5 5.5L8.7 6.8 12 10.1l3.3-3.3 2.2 2.2L12 14.5 6.5 9Zm0 6L12 20.5l5.5-5.5-2.2-2.2L12 16.1 8.7 12.8 6.5 15Z" />
        </svg>
      );
    case "op":
      return (
        <svg viewBox="0 0 24 24" className="size-[58%]" fill="currentColor">
          <path d="M7.5 8.5h9c2.2 0 4 1.8 4 4s-1.8 4-4 4h-9c-2.2 0-4-1.8-4-4s1.8-4 4-4Zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2h9c1.1 0 2-.9 2-2s-.9-2-2-2h-9Z" />
        </svg>
      );
    case "avax":
      return (
        <svg viewBox="0 0 24 24" className="size-[55%]" fill="currentColor">
          <path d="M12 3.2 4.2 18.5h3.4L12 9.8l4.4 8.7h3.4L12 3.2Zm-2.4 12.1h4.8L12 11.2l-2.4 4.1Z" />
        </svg>
      );
  }
}

export function ChainIcon({ chain, size = "md", className }: ChainIconProps) {
  const dim = SIZES[size];
  const style = STYLES[chain];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-white shadow-sm",
        style.bg,
        style.shadow,
        dim,
        className,
      )}
      aria-hidden
    >
      <Glyph kind={style.glyph} />
    </span>
  );
}
