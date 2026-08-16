import type { SupportedChain, TransactionType } from "@/types/transaction";

export type TransactionSource = "manual" | "example" | "direct_link";

export type TransactionErrorType =
  | "not_found"
  | "rpc_error"
  | "rate_limit"
  | "invalid_transaction"
  | "internal_error"
  | "unknown";

/**
 * Strongly typed product analytics events.
 * Do not add wallet addresses, tx hashes, or raw RPC errors as properties.
 */
export type AnalyticsEvents = {
  transaction_submitted: {
    chain: SupportedChain;
    source: TransactionSource;
  };
  transaction_success: {
    chain: SupportedChain;
    transactionType: TransactionType;
    source: TransactionSource;
  };
  transaction_error: {
    chain: SupportedChain;
    errorType: TransactionErrorType;
    source: TransactionSource;
  };
  network_selected: {
    chain: SupportedChain;
  };
  example_transaction_clicked: {
    chain: SupportedChain;
  };
};

export type AnalyticsEvent = keyof AnalyticsEvents;
