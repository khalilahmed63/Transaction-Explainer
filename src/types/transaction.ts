export type SupportedChain = "ethereum" | "base";

export type TransactionStatus = "success" | "failed" | "pending";

export type TransactionType =
  | "native_transfer"
  | "token_transfer"
  | "token_approval"
  | "token_swap"
  | "token_claim"
  | "contract_interaction"
  | "unknown";

export type ClassificationConfidence = "high" | "medium" | "low";

export type AssetMovement = {
  symbol: string;
  name?: string;
  amount: string;
  rawAmount: string;
  decimals: number;
  tokenAddress?: string;
  isNative?: boolean;
  iconUrl?: string;
};

export type TokenTransfer = {
  tokenAddress: string;
  symbol: string;
  name?: string;
  amount: string;
  rawAmount: string;
  decimals: number;
  from: string;
  to: string;
  fromLabel?: string;
  toLabel?: string;
  logIndex: number;
  iconUrl?: string;
};

export type TokenApproval = {
  tokenAddress: string;
  symbol: string;
  name?: string;
  spender: string;
  spenderLabel?: string;
  amount: string;
  rawAmount: string;
  decimals: number;
  isUnlimited: boolean;
  iconUrl?: string;
};

export type TransactionExplanation = {
  hash: string;
  chain: SupportedChain;
  status: TransactionStatus;
  blockNumber?: string;
  timestamp?: number;
  from: string;
  to?: string;
  transactionType: TransactionType;
  confidence: ClassificationConfidence;
  summary: string;
  nativeValue?: {
    amount: string;
    symbol: string;
  };
  gas: {
    gasUsed?: string;
    effectiveGasPrice?: string;
    fee?: string;
    symbol: "ETH";
  };
  tokenTransfers: TokenTransfer[];
  approvals: TokenApproval[];
  walletImpact: {
    sent: AssetMovement[];
    received: AssetMovement[];
  };
  /** Present for merkle-style claims when calldata allocation differs from transferred amount */
  claimDetails?: {
    allocationAmount: string;
    allocationSymbol: string;
    receivedAmount: string;
    receivedSymbol: string;
    note: string;
  };
  technical: {
    nonce?: number;
    blockHash?: string;
    methodId?: string;
    input?: string;
  };
  explorerUrl: string;
};

export type ApiErrorCode =
  | "invalid_hash"
  | "invalid_chain"
  | "not_found"
  | "rpc_error"
  | "rate_limited"
  | "internal_error";

export type ApiSuccessResponse = {
  ok: true;
  data: TransactionExplanation;
};

export type ApiErrorResponse = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;
