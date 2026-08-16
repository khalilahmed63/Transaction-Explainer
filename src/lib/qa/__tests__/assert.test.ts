import { describe, expect, it } from "vitest";
import type { TransactionExplanation } from "@/types/transaction";
import { assertExplanation } from "@/lib/qa/assert";

function baseTx(
  overrides: Partial<TransactionExplanation> = {},
): TransactionExplanation {
  return {
    hash: "0xabc",
    chain: "ethereum",
    status: "success",
    from: "0x1111111111111111111111111111111111111111",
    to: "0x2222222222222222222222222222222222222222",
    transactionType: "token_transfer",
    confidence: "high",
    summary: "You sent **100 USDC** to another wallet.",
    gas: { symbol: "ETH", fee: "0.001" },
    tokenTransfers: [
      {
        tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        amount: "100",
        rawAmount: "100000000",
        decimals: 6,
        from: "0x1111111111111111111111111111111111111111",
        to: "0x2222222222222222222222222222222222222222",
        logIndex: 0,
      },
    ],
    approvals: [],
    walletImpact: {
      sent: [
        {
          symbol: "USDC",
          amount: "100",
          rawAmount: "100000000",
          decimals: 6,
        },
      ],
      received: [],
    },
    technical: {},
    explorerUrl: "https://etherscan.io/tx/0xabc",
    ...overrides,
  };
}

describe("assertExplanation", () => {
  it("passes stable transfer facts", () => {
    const result = assertExplanation(
      {
        status: "success",
        type: "token_transfer",
        nativeSymbol: "ETH",
        sent: [{ symbol: "USDC", amountApprox: 100 }],
      },
      baseTx(),
    );
    expect(result.verdict).toBe("pass");
  });

  it("tolerates small amount formatting differences", () => {
    const result = assertExplanation(
      {
        sent: [{ symbol: "USDC", amountApprox: 100, amountTolerance: 0.02 }],
      },
      baseTx({
        walletImpact: {
          sent: [
            {
              symbol: "USDC",
              amount: "99.5",
              rawAmount: "99500000",
              decimals: 6,
            },
          ],
          received: [],
        },
      }),
    );
    expect(result.verdict).toBe("pass");
  });

  it("warns on allowed conservative type fallback", () => {
    const result = assertExplanation(
      {
        type: "token_swap",
        allowedTypes: ["token_swap", "contract_interaction"],
        allowFallback: true,
      },
      baseTx({ transactionType: "contract_interaction" }),
    );
    expect(result.verdict).toBe("warning");
    expect(result.reason).toMatch(/Expected:/i);
  });

  it("fails hard type mismatches without fallback", () => {
    const result = assertExplanation(
      { type: "token_swap" },
      baseTx({ transactionType: "token_transfer" }),
    );
    expect(result.verdict).toBe("fail");
    expect(result.reason).toContain("token_swap");
    expect(result.reason).toContain("token_transfer");
  });

  it("rejects successful movement language on failed txs", () => {
    const result = assertExplanation(
      { status: "failed", noSuccessfulMovements: true },
      baseTx({
        status: "failed",
        transactionType: "unknown",
        summary: "You sent **1 ETH** to a contract.",
        walletImpact: { sent: [], received: [] },
        tokenTransfers: [],
      }),
    );
    expect(result.verdict).toBe("fail");
  });

  it("checks unlimited approvals", () => {
    const result = assertExplanation(
      {
        type: "token_approval",
        approval: true,
        unlimitedApproval: true,
        approvalTokenSymbols: ["USDC", "USDC.e"],
      },
      baseTx({
        transactionType: "token_approval",
        summary: "You approved unlimited USDC spending.",
        tokenTransfers: [],
        walletImpact: { sent: [], received: [] },
        approvals: [
          {
            tokenAddress: "0x1",
            symbol: "USDC",
            spender: "0x2",
            amount: "Unlimited",
            rawAmount: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            decimals: 6,
            isUnlimited: true,
          },
        ],
      }),
    );
    expect(result.verdict).toBe("pass");
  });
});
