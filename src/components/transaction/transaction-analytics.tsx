"use client";

import { useEffect, useRef } from "react";
import type { SupportedChain, TransactionType } from "@/types/transaction";
import {
  consumeTransactionSource,
  trackEvent,
  type TransactionErrorType,
} from "@/lib/analytics";

type SuccessProps = {
  chain: SupportedChain;
  outcome: "success";
  transactionType: TransactionType;
};

type ErrorProps = {
  chain: SupportedChain;
  outcome: "error";
  errorType: TransactionErrorType;
  /** When false, skip transaction_submitted (e.g. invalid hash never entered analysis). */
  submitted?: boolean;
};

type TransactionAnalyticsProps = SuccessProps | ErrorProps;

/**
 * Fires product analytics once per result-page mount.
 * Distinguishes manual / example / direct_link via sessionStorage.
 */
export function TransactionAnalytics(props: TransactionAnalyticsProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const source = consumeTransactionSource();
    const shouldSubmit =
      props.outcome === "success" || props.submitted !== false;

    if (shouldSubmit) {
      trackEvent("transaction_submitted", {
        chain: props.chain,
        source,
      });
    }

    if (props.outcome === "success") {
      trackEvent("transaction_success", {
        chain: props.chain,
        transactionType: props.transactionType,
        source,
      });
    } else {
      trackEvent("transaction_error", {
        chain: props.chain,
        errorType: props.errorType,
        source,
      });
    }
  }, [props]);

  return null;
}
