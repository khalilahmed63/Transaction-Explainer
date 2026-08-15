import { TransactionSkeleton } from "@/components/transaction/transaction-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <TransactionSkeleton />
    </div>
  );
}
