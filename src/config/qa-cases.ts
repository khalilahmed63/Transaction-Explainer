import type {
  ApiErrorCode,
  SupportedChain,
  TransactionStatus,
  TransactionType,
} from "@/types/transaction";

export type QACategory =
  | "transfer"
  | "swap"
  | "approval"
  | "failed"
  | "account_abstraction"
  | "complex"
  | "unsupported"
  | "error_handling";

export type ExpectedAsset = {
  /** Primary symbol to match (case-insensitive). */
  symbol: string;
  /** Accept any of these symbols (e.g. USDC / USDC.e, BNB / WBNB). */
  alternateSymbols?: string[];
  /** Approximate human amount; compared with tolerance. */
  amountApprox?: number;
  /** Relative tolerance (default 0.02 = 2%). */
  amountTolerance?: number;
  /** Absolute tolerance floor for tiny amounts. */
  amountAbsTolerance?: number;
  isNative?: boolean;
};

export type QAExpectedFacts = {
  status?: TransactionStatus;
  type?: TransactionType;
  /** Soft pass if actual type is in this list (with preferred `type` → WARNING on fallback). */
  allowedTypes?: TransactionType[];
  nativeSymbol?: string;
  sent?: ExpectedAsset[];
  received?: ExpectedAsset[];
  /** Match movements in either sent or received. */
  anyDirection?: ExpectedAsset[];
  minTransferCount?: number;
  approval?: boolean;
  unlimitedApproval?: boolean;
  approvalTokenSymbols?: string[];
  /** Must complete without throwing. */
  mustNotCrash?: boolean;
  /**
   * When preferred `type` is missing but an `allowedTypes` / conservative
   * `contract_interaction` / `unknown` result is returned, mark WARNING.
   */
  allowFallback?: boolean;
  /** Failed txs must not describe completed token movements. */
  noSuccessfulMovements?: boolean;
};

export type QABlockchainCase = {
  id: string;
  name: string;
  chain: SupportedChain;
  hash: `0x${string}`;
  category: Exclude<QACategory, "error_handling">;
  kind: "blockchain";
  expected: QAExpectedFacts;
};

export type QASyntheticErrorCase = {
  id: string;
  name: string;
  category: "error_handling";
  kind: "synthetic_error";
  /** Display chain filter label; may be unsupported. */
  chainLabel: string;
  input: {
    chain: string;
    hash: string;
  };
  expectedError: {
    code: ApiErrorCode;
    messageIncludes?: string;
  };
  /** Exercise RpcRequestError → user-friendly mapping without a live RPC call. */
  simulateRpcFailure?: boolean;
};

export type QACase = QABlockchainCase | QASyntheticErrorCase;

export const QA_REAL_CASE_COUNT = 18;
export const QA_NETWORK_COUNT = 7;

/** Max concurrent blockchain RPC analyses for Run All. */
export const QA_CONCURRENCY = 3;

export const QA_CASES: QACase[] = [
  // ─── Ethereum ───────────────────────────────────────────────────────────
  {
    id: "eth-usdc-transfer",
    name: "USDC Transfer",
    chain: "ethereum",
    hash: "0xdf0564dcbb51d6230b3632f174ffa7b77654624ac3c67e404936d388098d7da9",
    category: "transfer",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_transfer",
      nativeSymbol: "ETH",
      anyDirection: [{ symbol: "USDC", amountApprox: 100 }],
    },
  },
  {
    id: "eth-eth-usdc-swap",
    name: "ETH → USDC Swap",
    chain: "ethereum",
    hash: "0x68dd965eb3112fbc5335efece039f6bf72050932b3c27ac6d7fa4f91e45695fc",
    category: "swap",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_swap",
      nativeSymbol: "ETH",
      sent: [
        {
          symbol: "ETH",
          alternateSymbols: ["WETH"],
          amountApprox: 0.00538186,
          amountTolerance: 0.03,
        },
      ],
      received: [{ symbol: "USDC", amountApprox: 10.1, amountTolerance: 0.03 }],
    },
  },
  {
    id: "eth-failed-swap",
    name: "Failed Contract/Swap Transaction",
    chain: "ethereum",
    hash: "0xb168028ba8fb205273e2e12b6e6c06b689f805b9b0086b321d1901d36286196a",
    category: "failed",
    kind: "blockchain",
    expected: {
      status: "failed",
      nativeSymbol: "ETH",
      noSuccessfulMovements: true,
      mustNotCrash: true,
    },
  },
  {
    id: "eth-complex-agg-swap",
    name: "Complex Aggregated Swap",
    chain: "ethereum",
    hash: "0x6f0061d0da634534aabb3152a180cffeb90dcda822fd01520287be42eaccb0e8",
    category: "complex",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_swap",
      allowedTypes: ["token_swap", "contract_interaction"],
      mustNotCrash: true,
      allowFallback: true,
      nativeSymbol: "ETH",
    },
  },

  // ─── Base ───────────────────────────────────────────────────────────────
  {
    id: "base-aa-native",
    name: "Account Abstraction Native Transfer",
    chain: "base",
    hash: "0x062a63aac97568c0ca1a231a66edae6fc188450b2a27799c8ed4e69a10a58530",
    category: "account_abstraction",
    kind: "blockchain",
    expected: {
      status: "success",
      mustNotCrash: true,
      allowFallback: true,
      nativeSymbol: "ETH",
    },
  },
  {
    id: "base-nft-edge",
    name: "NFT-heavy / Unsupported Edge Case",
    chain: "base",
    hash: "0x7b5b2c709da92d53d617cd16ddbcc27a047bd99e92b27c72f78341dfa2e6e616",
    category: "unsupported",
    kind: "blockchain",
    expected: {
      status: "success",
      mustNotCrash: true,
      allowFallback: true,
      nativeSymbol: "ETH",
    },
  },

  // ─── Arbitrum ───────────────────────────────────────────────────────────
  {
    id: "arb-usdc-bridge",
    name: "USDC Bridge Transfer",
    chain: "arbitrum",
    hash: "0x86422a58e3f0e054236e28ca636a9c4b4aa644219dc22184a6344c71d7379a11",
    category: "transfer",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_transfer",
      allowedTypes: ["token_transfer", "contract_interaction"],
      allowFallback: true,
      nativeSymbol: "ETH",
      sent: [{ symbol: "USDC", amountApprox: 73.894133, amountTolerance: 0.02 }],
    },
  },
  {
    id: "arb-eth-usdc-swap",
    name: "ETH → USDC Swap",
    chain: "arbitrum",
    hash: "0x7018c8b20f4b812ccb3106dac90310fcc2265a8c1f39f0f0cb717e9dfded0958",
    category: "swap",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_swap",
      nativeSymbol: "ETH",
      sent: [
        {
          symbol: "ETH",
          alternateSymbols: ["WETH"],
          amountApprox: 0.03,
          amountTolerance: 0.03,
        },
      ],
      received: [
        { symbol: "USDC", amountApprox: 56.6181, amountTolerance: 0.03 },
      ],
    },
  },
  {
    id: "arb-aa-usdc",
    name: "Account Abstraction USDC Transfer",
    chain: "arbitrum",
    hash: "0xd031005e3b97d228a35ea7bfeb5dac8d1de2f8cbae31fac0cb23e4b713cdbadf",
    category: "account_abstraction",
    kind: "blockchain",
    expected: {
      status: "success",
      mustNotCrash: true,
      allowFallback: true,
      anyDirection: [
        { symbol: "USDC", amountApprox: 0.01, amountTolerance: 0.2, amountAbsTolerance: 0.005 },
      ],
    },
  },

  // ─── Polygon ────────────────────────────────────────────────────────────
  {
    id: "poly-pol-weth-swap",
    name: "POL → WETH Swap",
    chain: "polygon",
    hash: "0x2c44c788c8e796658d0146c19d3eda5bc1580ed19d9e4e057e9f39e825f6b9d3",
    category: "swap",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_swap",
      nativeSymbol: "POL",
      sent: [
        {
          symbol: "POL",
          alternateSymbols: ["WMATIC", "WPOL", "MATIC"],
          amountApprox: 807.4017,
          amountTolerance: 0.03,
        },
      ],
      received: [
        {
          symbol: "WETH",
          alternateSymbols: ["ETH"],
          amountApprox: 0.03229403,
          amountTolerance: 0.05,
          amountAbsTolerance: 1e-7,
        },
      ],
    },
  },
  {
    id: "poly-pol-usdc-swap",
    name: "POL → USDC Swap",
    chain: "polygon",
    hash: "0xdddc600200d21d555ec897d645cb33174e0377db703d73b952aaa146e298ba45",
    category: "swap",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_swap",
      nativeSymbol: "POL",
      sent: [
        {
          symbol: "POL",
          alternateSymbols: ["WMATIC", "WPOL", "MATIC"],
          amountApprox: 1,
          amountTolerance: 0.03,
        },
      ],
      received: [
        {
          symbol: "USDC",
          alternateSymbols: ["USDC.e", "USDC.E"],
          amountApprox: 0.07478,
          amountTolerance: 0.05,
          amountAbsTolerance: 1e-6,
        },
      ],
    },
  },

  // ─── BNB Chain ──────────────────────────────────────────────────────────
  {
    id: "bsc-wbnb-usdc-swap",
    name: "WBNB → USDC Swap",
    chain: "bsc",
    hash: "0xb3d114d9747ed7aa4d02747a7a45b00ed7066fc9e0afd8b119a1317040b6c14b",
    category: "swap",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_swap",
      nativeSymbol: "BNB",
      sent: [
        {
          symbol: "WBNB",
          alternateSymbols: ["BNB"],
          amountApprox: 0.0284,
          amountTolerance: 0.03,
        },
      ],
      received: [
        { symbol: "USDC", amountApprox: 17.1824, amountTolerance: 0.03 },
      ],
    },
  },
  {
    id: "bsc-wbnb-native-edge",
    name: "WBNB / Native BNB Edge Case",
    chain: "bsc",
    hash: "0x4cccfcde110b1913de4100528e1605240cdba477e914d82fbe497b39cd94d209",
    category: "complex",
    kind: "blockchain",
    expected: {
      status: "success",
      mustNotCrash: true,
      allowFallback: true,
      nativeSymbol: "BNB",
    },
  },

  // ─── Optimism ───────────────────────────────────────────────────────────
  {
    id: "op-usdc-transfer",
    name: "USDC Transfer",
    chain: "optimism",
    hash: "0xd207e9c7e470deb2c2846baf9d308f53298c9150c84cd1e7f482bf1fce91d0df",
    category: "transfer",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_transfer",
      nativeSymbol: "ETH",
      anyDirection: [{ symbol: "USDC", amountApprox: 10, amountTolerance: 0.02 }],
    },
  },
  {
    id: "op-unlimited-usdc-approval",
    name: "Unlimited USDC Approval",
    chain: "optimism",
    hash: "0x067d0dac905cf084d6d26a5ae8b31531bdfa35fdf0581a0246fa07dbe1575bb3",
    category: "approval",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_approval",
      nativeSymbol: "ETH",
      approval: true,
      unlimitedApproval: true,
      approvalTokenSymbols: ["USDC", "USDC.e", "USDC.E"],
    },
  },
  {
    id: "op-eth-susd-swap",
    name: "ETH → sUSD Swap",
    chain: "optimism",
    hash: "0xc8788f3573f58ae92b03bb84695c6e4109e03c4f2271b333641cccff86fd8cf1",
    category: "swap",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_swap",
      nativeSymbol: "ETH",
      sent: [
        {
          symbol: "ETH",
          alternateSymbols: ["WETH"],
          amountApprox: 0.33,
          amountTolerance: 0.05,
        },
      ],
      received: [
        {
          symbol: "sUSD",
          alternateSymbols: ["SUSD"],
          amountApprox: 541.77,
          amountTolerance: 0.03,
        },
      ],
    },
  },

  // ─── Avalanche ──────────────────────────────────────────────────────────
  {
    id: "avax-usdc-wavax-swap",
    name: "USDC → WAVAX Swap",
    chain: "avalanche",
    hash: "0xc25126e1b9d158a88b455ee4dd229d4e285b022e66fc872a5b86e355a25d887e",
    category: "swap",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_swap",
      nativeSymbol: "AVAX",
      sent: [{ symbol: "USDC", amountApprox: 190.9952, amountTolerance: 0.02 }],
      received: [
        {
          symbol: "WAVAX",
          alternateSymbols: ["AVAX"],
          amountApprox: 30,
          amountTolerance: 0.03,
        },
      ],
    },
  },
  {
    id: "avax-stargate-usdc",
    name: "Stargate USDC Send / Bridge Interaction",
    chain: "avalanche",
    hash: "0xe052daa08f16d407899f49fdbb6f0f25fbed58797aad6fcb3bd103440e48fd48",
    category: "complex",
    kind: "blockchain",
    expected: {
      status: "success",
      type: "token_transfer",
      allowedTypes: ["token_transfer", "contract_interaction"],
      allowFallback: true,
      mustNotCrash: true,
      nativeSymbol: "AVAX",
      anyDirection: [
        { symbol: "USDC", amountApprox: 463.4431, amountTolerance: 0.02 },
      ],
    },
  },

  // ─── Synthetic error handling ───────────────────────────────────────────
  {
    id: "err-invalid-hash",
    name: "Invalid Hash",
    category: "error_handling",
    kind: "synthetic_error",
    chainLabel: "Ethereum",
    input: { chain: "ethereum", hash: "0xdead" },
    expectedError: {
      code: "invalid_hash",
      messageIncludes: "valid transaction hash",
    },
  },
  {
    id: "err-nonexistent-hash",
    name: "Valid-Looking Nonexistent Hash",
    category: "error_handling",
    kind: "synthetic_error",
    chainLabel: "Ethereum",
    input: {
      chain: "ethereum",
      hash: "0x00000000000000000000000000000000000000000000000000000000000000aa",
    },
    expectedError: {
      code: "not_found",
      messageIncludes: "couldn't find",
    },
  },
  {
    id: "err-unsupported-chain",
    name: "Unsupported Chain",
    category: "error_handling",
    kind: "synthetic_error",
    chainLabel: "Unsupported",
    input: {
      chain: "solana",
      hash: "0xdf0564dcbb51d6230b3632f174ffa7b77654624ac3c67e404936d388098d7da9",
    },
    expectedError: {
      code: "invalid_chain",
      messageIncludes: "supported network",
    },
  },
  {
    id: "err-wrong-chain",
    name: "Transaction on Wrong Selected Chain",
    category: "error_handling",
    kind: "synthetic_error",
    chainLabel: "Polygon",
    input: {
      // Real Ethereum USDC transfer queried on Polygon
      chain: "polygon",
      hash: "0xdf0564dcbb51d6230b3632f174ffa7b77654624ac3c67e404936d388098d7da9",
    },
    expectedError: {
      code: "not_found",
      messageIncludes: "couldn't find",
    },
  },
  {
    id: "err-rpc-failure",
    name: "RPC / Network Failure (simulated)",
    category: "error_handling",
    kind: "synthetic_error",
    chainLabel: "Ethereum",
    input: {
      chain: "ethereum",
      hash: "0xdf0564dcbb51d6230b3632f174ffa7b77654624ac3c67e404936d388098d7da9",
    },
    simulateRpcFailure: true,
    expectedError: {
      code: "rpc_error",
      messageIncludes: "couldn't reach",
    },
  },
];

export function getQaCaseById(id: string): QACase | undefined {
  return QA_CASES.find((c) => c.id === id);
}

export function getBlockchainQaCases(): QABlockchainCase[] {
  return QA_CASES.filter((c): c is QABlockchainCase => c.kind === "blockchain");
}

export function chainFilterLabel(chain: SupportedChain | "all"): string {
  if (chain === "all") return "All";
  const labels: Record<SupportedChain, string> = {
    ethereum: "Ethereum",
    base: "Base",
    arbitrum: "Arbitrum",
    polygon: "Polygon",
    bsc: "BNB Chain",
    optimism: "Optimism",
    avalanche: "Avalanche",
  };
  return labels[chain];
}
