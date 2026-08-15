import { describe, expect, it } from "vitest";
import { classifyTransaction } from "@/lib/blockchain/classify";
import { buildTransactionSummary } from "@/lib/blockchain/explain";
import { computeWalletImpact } from "@/lib/blockchain/wallet-impact";
import { MOCK_TRANSACTIONS } from "@/lib/mocks/transactions";
import type { TokenTransfer } from "@/types/transaction";

const wallet = "0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E";

describe("classifyTransaction", () => {
  it("classifies native ETH transfer", () => {
    const result = classifyTransaction({
      status: "success",
      nativeValueWei: 500000000000000000n,
      to: "0x9123456789abcdef0123456789abcdef01234567",
      tokenTransfers: [],
      approvals: [],
      walletImpact: {
        sent: [
          {
            symbol: "ETH",
            amount: "0.5",
            rawAmount: "500000000000000000",
            decimals: 18,
            isNative: true,
          },
        ],
        received: [],
      },
      hasInputData: false,
    });
    expect(result.type).toBe("native_transfer");
    expect(result.confidence).toBe("high");
  });

  it("classifies ERC-20 transfer", () => {
    const transfers: TokenTransfer[] = [
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        symbol: "USDC",
        amount: "250",
        rawAmount: "250000000",
        decimals: 6,
        from: wallet,
        to: "0x91abcdef0123456789abcdef0123456789abcdef",
        logIndex: 0,
      },
    ];
    const impact = computeWalletImpact({
      wallet,
      tokenTransfers: transfers,
    });
    const result = classifyTransaction({
      status: "success",
      nativeValueWei: 0n,
      to: transfers[0].tokenAddress,
      tokenTransfers: transfers,
      approvals: [],
      walletImpact: impact,
      hasInputData: true,
    });
    expect(result.type).toBe("token_transfer");
  });

  it("classifies approval", () => {
    const result = classifyTransaction({
      status: "success",
      nativeValueWei: 0n,
      to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      tokenTransfers: [],
      approvals: [
        {
          tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          symbol: "USDC",
          spender: "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          amount: "1000",
          rawAmount: "1000000000",
          decimals: 6,
          isUnlimited: false,
        },
      ],
      walletImpact: { sent: [], received: [] },
      hasInputData: true,
    });
    expect(result.type).toBe("token_approval");
  });

  it("classifies simple swap", () => {
    const transfers: TokenTransfer[] = [
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        symbol: "USDC",
        amount: "500",
        rawAmount: "500000000",
        decimals: 6,
        from: wallet,
        to: "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
        logIndex: 0,
      },
      {
        tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        symbol: "WETH",
        amount: "0.21",
        rawAmount: "210000000000000000",
        decimals: 18,
        from: "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
        to: wallet,
        logIndex: 1,
      },
    ];
    const impact = computeWalletImpact({
      wallet,
      tokenTransfers: transfers,
    });
    const result = classifyTransaction({
      status: "success",
      nativeValueWei: 0n,
      to: "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
      tokenTransfers: transfers,
      approvals: [],
      walletImpact: impact,
      hasInputData: true,
    });
    expect(result.type).toBe("token_swap");
  });

  it("classifies token claims", () => {
    const result = classifyTransaction({
      status: "success",
      nativeValueWei: BigInt(0),
      to: "0x3ef3d8ba38ebe18db133cec108f4d14ce00dd9ae",
      tokenTransfers: [
        {
          tokenAddress: "0x09be1692ca16e06f536f0038ff11d1da8524adb1",
          symbol: "TEL",
          amount: "485",
          rawAmount: "48500",
          decimals: 2,
          from: "0x3ef3d8ba38ebe18db133cec108f4d14ce00dd9ae",
          to: wallet,
          logIndex: 0,
        },
      ],
      approvals: [],
      walletImpact: {
        sent: [],
        received: [
          {
            symbol: "TEL",
            amount: "485",
            rawAmount: "48500",
            decimals: 2,
            tokenAddress: "0x09be1692ca16e06f536f0038ff11d1da8524adb1",
          },
        ],
      },
      hasInputData: true,
      input:
        "0x71ee95c00000000000000000000000000000000000000000000000000000000000000080",
    });
    expect(result.type).toBe("token_claim");
    expect(result.confidence).toBe("high");
  });

  it("classifies unknown contract interaction", () => {
    const result = classifyTransaction({
      status: "success",
      nativeValueWei: 0n,
      to: "0x1234567890123456789012345678901234567890",
      tokenTransfers: [],
      approvals: [],
      walletImpact: { sent: [], received: [] },
      hasInputData: true,
    });
    expect(result.type).toBe("contract_interaction");
  });

  it("does not treat failed txs as completed transfers", () => {
    const result = classifyTransaction({
      status: "failed",
      nativeValueWei: 0n,
      to: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
      tokenTransfers: [],
      approvals: [],
      walletImpact: { sent: [], received: [] },
      hasInputData: true,
    });
    expect(result.type).toBe("unknown");
    const summary = buildTransactionSummary({
      ...MOCK_TRANSACTIONS.failed_tx,
      transactionType: result.type,
      confidence: result.confidence,
    });
    expect(summary).toContain("did not complete successfully");
  });
});

describe("buildTransactionSummary", () => {
  it("explains ETH transfer", () => {
    const summary = buildTransactionSummary(MOCK_TRANSACTIONS.eth_transfer);
    expect(summary).toContain("0.5 ETH");
    expect(summary).toContain("You sent");
  });

  it("explains USDC transfer", () => {
    const summary = buildTransactionSummary(MOCK_TRANSACTIONS.usdc_transfer);
    expect(summary).toContain("250 USDC");
  });

  it("explains approval", () => {
    const summary = buildTransactionSummary(MOCK_TRANSACTIONS.usdc_approval);
    expect(summary).toContain("USDC");
    expect(summary.toLowerCase()).toContain("permission");
  });

  it("explains swap", () => {
    const summary = buildTransactionSummary(MOCK_TRANSACTIONS.usdc_eth_swap);
    expect(summary).toContain("500 USDC");
    expect(summary).toContain("0.21 WETH");
  });

  it("explains claim", () => {
    const summary = buildTransactionSummary({
      chain: "base",
      status: "success",
      from: "0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E",
      to: "0x3ef3d8ba38ebe18db133cec108f4d14ce00dd9ae",
      transactionType: "token_claim",
      confidence: "high",
      tokenTransfers: [],
      approvals: [],
      walletImpact: {
        sent: [],
        received: [
          {
            symbol: "TEL",
            amount: "485",
            rawAmount: "48500",
            decimals: 2,
            tokenAddress: "0x09be1692ca16e06f536f0038ff11d1da8524adb1",
          },
        ],
      },
    });
    expect(summary).toContain("claimed");
    expect(summary).toContain("485 TEL");
  });

  it("explains partial merkle claim allocation", () => {
    const summary = buildTransactionSummary({
      chain: "base",
      status: "success",
      from: "0x329e6cbdd16cad2f51d97d2e8f09612f12d45a6d",
      to: "0x3ef3d8ba38ebe18db133cec108f4d14ce00dd9ae",
      transactionType: "token_claim",
      confidence: "high",
      tokenTransfers: [],
      approvals: [],
      walletImpact: {
        sent: [],
        received: [
          {
            symbol: "TEL",
            amount: "485",
            rawAmount: "48500",
            decimals: 2,
            tokenAddress: "0x09be1692ca16e06f536f0038ff11d1da8524adb1",
          },
        ],
      },
      claimDetails: {
        allocationAmount: "970",
        allocationSymbol: "TEL",
        receivedAmount: "485",
        receivedSymbol: "TEL",
        note: "test",
      },
    });
    expect(summary).toContain("485 TEL");
    expect(summary).toContain("970 TEL");
    expect(summary).toContain("remaining");
  });
});

describe("computeWalletImpact", () => {
  it("aggregates multiple transfers of the same token", () => {
    const transfers: TokenTransfer[] = [
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        symbol: "USDC",
        amount: "100",
        rawAmount: "100000000",
        decimals: 6,
        from: wallet,
        to: "0x1111111111111111111111111111111111111111",
        logIndex: 0,
      },
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        symbol: "USDC",
        amount: "50",
        rawAmount: "50000000",
        decimals: 6,
        from: wallet,
        to: "0x2222222222222222222222222222222222222222",
        logIndex: 1,
      },
    ];
    const impact = computeWalletImpact({ wallet, tokenTransfers: transfers });
    expect(impact.sent).toHaveLength(1);
    expect(impact.sent[0].rawAmount).toBe("150000000");
  });
});
