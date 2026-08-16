import { describe, expect, it } from "vitest";
import {
  plainSummary,
  truncateSummary,
  transactionTypeLabel,
} from "@/lib/og/transaction-card";

describe("og helpers", () => {
  it("strips markdown emphasis from summaries", () => {
    expect(plainSummary("You sent **25 USDC** to 0xb25e...9B80.")).toBe(
      "You sent 25 USDC to 0xb25e...9B80.",
    );
  });

  it("truncates long summaries", () => {
    const long = "a".repeat(200);
    expect(truncateSummary(long, 40).endsWith("…")).toBe(true);
    expect(truncateSummary(long, 40).length).toBeLessThanOrEqual(40);
  });

  it("labels transaction types for the card", () => {
    expect(transactionTypeLabel("token_transfer")).toBe("Token Transfer");
    expect(transactionTypeLabel("token_swap")).toBe("Swap");
  });
});
