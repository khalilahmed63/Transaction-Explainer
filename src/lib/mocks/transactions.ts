import type { TransactionExplanation } from "@/types/transaction";

/**
 * Realistic mock explanations for UI development only.
 * Never returned by the production API when RPC fails.
 */
export const MOCK_TRANSACTIONS: Record<string, TransactionExplanation> = {
  eth_transfer: {
    hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    chain: "ethereum",
    status: "success",
    blockNumber: "21000000",
    timestamp: 1723700000,
    from: "0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E",
    to: "0x9123456789abcdef0123456789abcdef01234567",
    transactionType: "native_transfer",
    confidence: "high",
    summary: "You sent **0.5 ETH** to 0x9123...4567.",
    nativeValue: { amount: "0.5", symbol: "ETH" },
    gas: {
      gasUsed: "21000",
      effectiveGasPrice: "20 Gwei",
      fee: "0.00042",
      symbol: "ETH",
    },
    tokenTransfers: [],
    approvals: [],
    walletImpact: {
      sent: [
        {
          symbol: "ETH",
          name: "Ether",
          amount: "0.5",
          rawAmount: "500000000000000000",
          decimals: 18,
          isNative: true,
        },
      ],
      received: [],
    },
    technical: {
      nonce: 42,
      blockHash: "0xabc",
      methodId: undefined,
    },
    explorerUrl:
      "https://etherscan.io/tx/0x1111111111111111111111111111111111111111111111111111111111111111",
  },

  usdc_transfer: {
    hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    chain: "ethereum",
    status: "success",
    blockNumber: "21000001",
    timestamp: 1723701000,
    from: "0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E",
    to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    transactionType: "token_transfer",
    confidence: "high",
    summary: "You sent **250 USDC** to 0x91ab...cdef.",
    gas: {
      gasUsed: "65000",
      effectiveGasPrice: "18 Gwei",
      fee: "0.00117",
      symbol: "ETH",
    },
    tokenTransfers: [
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        symbol: "USDC",
        name: "USD Coin",
        amount: "250",
        rawAmount: "250000000",
        decimals: 6,
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E",
        to: "0x91abcdef0123456789abcdef0123456789abcdef",
        logIndex: 0,
      },
    ],
    approvals: [],
    walletImpact: {
      sent: [
        {
          symbol: "USDC",
          name: "USD Coin",
          amount: "250",
          rawAmount: "250000000",
          decimals: 6,
          tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        },
      ],
      received: [],
    },
    technical: { nonce: 43, methodId: "0xa9059cbb" },
    explorerUrl:
      "https://etherscan.io/tx/0x2222222222222222222222222222222222222222222222222222222222222222",
  },

  usdc_approval: {
    hash: "0x3333333333333333333333333333333333333333333333333333333333333333",
    chain: "ethereum",
    status: "success",
    blockNumber: "21000002",
    timestamp: 1723702000,
    from: "0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E",
    to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    transactionType: "token_approval",
    confidence: "high",
    summary:
      "You gave **Uniswap Universal Router** permission to spend up to **1,000 USDC** from your wallet.",
    gas: {
      gasUsed: "46000",
      effectiveGasPrice: "15 Gwei",
      fee: "0.00069",
      symbol: "ETH",
    },
    tokenTransfers: [],
    approvals: [
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        symbol: "USDC",
        name: "USD Coin",
        spender: "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
        spenderLabel: "Uniswap Universal Router",
        amount: "1,000",
        rawAmount: "1000000000",
        decimals: 6,
        isUnlimited: false,
      },
    ],
    walletImpact: { sent: [], received: [] },
    technical: { nonce: 44, methodId: "0x095ea7b3" },
    explorerUrl:
      "https://etherscan.io/tx/0x3333333333333333333333333333333333333333333333333333333333333333",
  },

  usdc_eth_swap: {
    hash: "0x4444444444444444444444444444444444444444444444444444444444444444",
    chain: "ethereum",
    status: "success",
    blockNumber: "21000003",
    timestamp: 1723703000,
    from: "0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E",
    to: "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
    transactionType: "token_swap",
    confidence: "high",
    summary: "You swapped approximately **500 USDC** for **0.21 WETH**.",
    gas: {
      gasUsed: "186481",
      effectiveGasPrice: "22 Gwei",
      fee: "0.0041",
      symbol: "ETH",
    },
    tokenTransfers: [
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        symbol: "USDC",
        name: "USD Coin",
        amount: "500",
        rawAmount: "500000000",
        decimals: 6,
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E",
        to: "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
        toLabel: "Uniswap Universal Router",
        logIndex: 0,
      },
      {
        tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        symbol: "WETH",
        name: "Wrapped Ether",
        amount: "0.21",
        rawAmount: "210000000000000000",
        decimals: 18,
        from: "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
        fromLabel: "Uniswap Universal Router",
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E",
        logIndex: 1,
      },
    ],
    approvals: [],
    walletImpact: {
      sent: [
        {
          symbol: "USDC",
          name: "USD Coin",
          amount: "500",
          rawAmount: "500000000",
          decimals: 6,
          tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        },
      ],
      received: [
        {
          symbol: "WETH",
          name: "Wrapped Ether",
          amount: "0.21",
          rawAmount: "210000000000000000",
          decimals: 18,
          tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        },
      ],
    },
    technical: { nonce: 45, methodId: "0x3593564c" },
    explorerUrl:
      "https://etherscan.io/tx/0x4444444444444444444444444444444444444444444444444444444444444444",
  },

  failed_tx: {
    hash: "0x5555555555555555555555555555555555555555555555555555555555555555",
    chain: "ethereum",
    status: "failed",
    blockNumber: "21000004",
    timestamp: 1723704000,
    from: "0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E",
    to: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
    transactionType: "unknown",
    confidence: "high",
    summary:
      "This transaction was submitted to the network but did not complete successfully.",
    gas: {
      gasUsed: "120000",
      effectiveGasPrice: "25 Gwei",
      fee: "0.003",
      symbol: "ETH",
    },
    tokenTransfers: [],
    approvals: [],
    walletImpact: { sent: [], received: [] },
    technical: { nonce: 46, methodId: "0x38ed1739" },
    explorerUrl:
      "https://etherscan.io/tx/0x5555555555555555555555555555555555555555555555555555555555555555",
  },
};
