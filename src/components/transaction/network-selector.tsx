"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { SupportedChain } from "@/types/transaction";
import { CHAIN_CONFIG, CHAIN_ORDER } from "@/lib/blockchain/chains";
import { ChainIcon } from "@/components/ui/chain-icon";
import { cn } from "@/lib/utils/cn";

type NetworkSelectorProps = {
  value: SupportedChain;
  onChange: (chain: SupportedChain) => void;
  disabled?: boolean;
};

export function NetworkSelector({
  value,
  onChange,
  disabled,
}: NetworkSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const config = CHAIN_CONFIG[value];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-12 items-center gap-2.5 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground transition-all",
          "hover:bg-surface-hover hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "sm:min-w-[168px]",
        )}
      >
        <ChainIcon chain={value} size="sm" />
        <span className="truncate">{config.name}</span>
        <ChevronDown
          className={cn(
            "ml-auto size-4 shrink-0 text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Select network"
          className="animate-in absolute left-0 top-full z-50 mt-1.5 max-h-72 min-w-[200px] overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface py-1 shadow-lg shadow-black/8"
        >
          {CHAIN_ORDER.map((chain) => {
            const selected = chain === value;
            return (
              <li key={chain} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-surface-hover",
                    selected && "bg-accent/5 text-accent",
                  )}
                  onClick={() => {
                    onChange(chain);
                    setOpen(false);
                  }}
                >
                  <ChainIcon chain={chain} size="sm" />
                  <span className="font-medium">{CHAIN_CONFIG[chain].name}</span>
                  {selected && <Check className="ml-auto size-4" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
