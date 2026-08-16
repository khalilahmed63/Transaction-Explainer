"use client";

import { ClipboardPaste, LoaderCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ClipboardEvent,
  FormEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import type { SupportedChain } from "@/types/transaction";
import { NetworkSelector } from "@/components/transaction/network-selector";
import {
  getHashValidationError,
  isValidTxHash,
  normalizeHash,
} from "@/lib/validation/transaction";
import { cn } from "@/lib/utils/cn";

type TransactionSearchProps = {
  defaultChain?: SupportedChain;
  defaultHash?: string;
  className?: string;
};

export function TransactionSearch({
  defaultChain = "ethereum",
  defaultHash = "",
  className,
}: TransactionSearchProps) {
  const router = useRouter();
  const [chain, setChain] = useState<SupportedChain>(defaultChain);
  const [hash, setHash] = useState(defaultHash);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastSubmittedRef = useRef<string | null>(null);

  const validationError = getHashValidationError(hash);
  const canSubmit = isValidTxHash(hash) && !isPending;

  function submit(rawHash: string = hash, nextChain: SupportedChain = chain) {
    if (!isValidTxHash(rawHash)) {
      setError("That doesn't look like a valid transaction hash.");
      return;
    }

    const normalized = normalizeHash(rawHash);
    const destination = `/tx/${nextChain}/${normalized}`;

    // Avoid double-navigating the same paste/submit.
    if (isPending && lastSubmittedRef.current === destination) {
      return;
    }

    lastSubmittedRef.current = destination;
    setHash(rawHash.trim());
    setError(null);
    startTransition(() => {
      router.push(destination);
    });
  }

  function maybeAutoSubmit(raw: string, nextChain: SupportedChain = chain) {
    const trimmed = raw.trim();
    if (!isValidTxHash(trimmed)) return;
    submit(trimmed, nextChain);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function onHashPaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text");
    if (!isValidTxHash(pasted)) return;

    e.preventDefault();
    setHash(pasted.trim());
    setError(null);
    maybeAutoSubmit(pasted);
  }

  async function onPaste() {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      setHash(trimmed);
      setError(null);
      maybeAutoSubmit(trimmed);
    } catch {
      setError("Couldn't read from clipboard. Paste manually instead.");
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)} noValidate>
      <div className="rounded-2xl border border-border bg-surface p-2 shadow-sm shadow-black/[0.03] sm:p-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <NetworkSelector
            value={chain}
            onChange={setChain}
            disabled={isPending}
          />

          <div className="relative min-w-0 flex-1">
            <label htmlFor="tx-hash" className="sr-only">
              Transaction hash
            </label>
            <input
              id="tx-hash"
              name="hash"
              type="text"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              placeholder="Paste transaction hash — 0x..."
              value={hash}
              disabled={isPending}
              onPaste={onHashPaste}
              onChange={(e) => {
                setHash(e.target.value);
                setError(null);
              }}
              className={cn(
                "h-12 w-full rounded-xl border bg-background px-4 pr-12 font-mono text-sm text-foreground placeholder:font-sans placeholder:text-muted",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                "disabled:cursor-not-allowed disabled:opacity-60",
                error || (hash && validationError)
                  ? "border-danger/50"
                  : "border-transparent sm:border-border/60",
              )}
              aria-invalid={Boolean(error || (hash && validationError))}
              aria-describedby={
                error || (hash && validationError) ? "tx-hash-error" : undefined
              }
            />
            <button
              type="button"
              onClick={onPaste}
              disabled={isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
              aria-label="Paste from clipboard"
            >
              <ClipboardPaste className="size-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground transition-all",
            "hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isPending && "cursor-wait",
          )}
        >
          {isPending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="size-4 opacity-90" aria-hidden />
              Explain Transaction
            </>
          )}
        </button>
      </div>

      <p className="mt-2 px-1 text-xs text-muted">
        Paste a valid hash to explain automatically — or press the button.
      </p>

      {(error || (hash && validationError)) && (
        <p id="tx-hash-error" className="mt-2 px-1 text-sm text-danger" role="alert">
          {error || validationError}
        </p>
      )}
    </form>
  );
}
