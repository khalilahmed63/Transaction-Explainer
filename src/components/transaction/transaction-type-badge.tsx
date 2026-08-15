import {
  ArrowLeftRight,
  FileCode2,
  Gift,
  HelpCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { TransactionType } from "@/types/transaction";
import { cn } from "@/lib/utils/cn";

const TYPE_CONFIG: Record<
  TransactionType,
  { label: string; icon: typeof Send; className: string }
> = {
  native_transfer: {
    label: "ETH Transfer",
    icon: Send,
    className: "bg-[#627EEA]/10 text-[#4c63c7] dark:text-[#9db0ff]",
  },
  token_transfer: {
    label: "Token Transfer",
    icon: Send,
    className: "bg-accent/10 text-accent",
  },
  token_approval: {
    label: "Approval",
    icon: ShieldCheck,
    className: "bg-warning/10 text-warning",
  },
  token_swap: {
    label: "Swap",
    icon: ArrowLeftRight,
    className: "bg-accent/10 text-accent",
  },
  token_claim: {
    label: "Claim",
    icon: Gift,
    className: "bg-success/10 text-success",
  },
  contract_interaction: {
    label: "Contract",
    icon: FileCode2,
    className: "bg-surface-hover text-muted",
  },
  unknown: {
    label: "Unknown",
    icon: HelpCircle,
    className: "bg-surface-hover text-muted",
  },
};

export function TransactionTypeBadge({
  type,
  className,
}: {
  type: TransactionType;
  className?: string;
}) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {config.label}
    </span>
  );
}

export function TransactionTypeIcon({
  type,
  className,
}: {
  type: TransactionType;
  className?: string;
}) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-2xl",
        config.className,
        className,
      )}
      aria-hidden
    >
      <Icon className="size-5" />
    </span>
  );
}
