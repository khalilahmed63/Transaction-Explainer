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

export function ChainIcon({ chain, size = "md", className }: ChainIconProps) {
  const dim = SIZES[size];

  if (chain === "ethereum") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-[#627EEA] text-white shadow-sm shadow-[#627EEA]/25",
          dim,
          className,
        )}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="size-[58%]" fill="currentColor">
          <path d="M12 1.75 5.75 12.25l6.25 2.7 6.25-2.7L12 1.75Z" opacity="0.7" />
          <path d="M12 16.15 5.75 13.25 12 22.25l6.25-9-6.25 2.9Z" />
          <path d="M12 1.75v11.2l6.25-.7L12 1.75Z" opacity="0.85" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#0052FF] text-white shadow-sm shadow-[#0052FF]/25",
        dim,
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-[52%]" fill="currentColor">
        <path d="M12.15 3.2c-2.2 2.7-3.7 6.35-3.95 10.4h7.9c-.25-4.05-1.75-7.7-3.95-10.4Z" />
        <path
          d="M8.2 14.85c.35 2.9 1.55 5.45 3.3 7.15.1.1.25.1.35 0 1.75-1.7 2.95-4.25 3.3-7.15H8.2Z"
          opacity="0.75"
        />
      </svg>
    </span>
  );
}
