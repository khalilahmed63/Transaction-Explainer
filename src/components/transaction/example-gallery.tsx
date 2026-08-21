import Link from "next/link";
import {
  ArrowLeftRight,
  Gift,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ChainIcon } from "@/components/ui/chain-icon";
import type { ExampleGalleryItem } from "@/config/app";
import type { TransactionType } from "@/types/transaction";

const TYPE_ICONS: Record<TransactionType, typeof Send> = {
  native_transfer: Send,
  token_transfer: Send,
  token_approval: ShieldCheck,
  token_swap: ArrowLeftRight,
  token_claim: Gift,
  contract_interaction: Sparkles,
  unknown: Sparkles,
};

type ExampleGalleryProps = {
  items: ExampleGalleryItem[];
};

export function ExampleGallery({ items }: ExampleGalleryProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = TYPE_ICONS[item.type] ?? Sparkles;
        return (
          <Link
            key={`${item.chain}-${item.hash}`}
            href={`/tx/${item.chain}/${item.hash}`}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-accent-foreground shadow-sm shadow-accent/15">
              <Icon className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {item.label}
              </p>
              <p className="text-xs text-muted">See the explanation →</p>
            </div>
            <ChainIcon chain={item.chain} size="sm" />
          </Link>
        );
      })}
    </div>
  );
}
