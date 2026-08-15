import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { TransactionStatus } from "@/types/transaction";
import { cn } from "@/lib/utils/cn";

const STATUS_CONFIG = {
  success: {
    label: "Successful",
    icon: CheckCircle2,
    className: "text-success bg-success/10",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "text-danger bg-danger/10",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "text-warning bg-warning/10",
  },
} as const;

export function TransactionStatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {config.label}
    </span>
  );
}
