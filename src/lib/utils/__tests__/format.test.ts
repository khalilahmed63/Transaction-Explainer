import { describe, expect, it } from "vitest";
import {
  getHashValidationError,
  isSupportedChain,
  isValidTxHash,
} from "@/lib/validation/transaction";
import { formatAddress, formatTokenAmount } from "@/lib/utils/format";

describe("validation", () => {
  it("accepts valid hashes", () => {
    expect(
      isValidTxHash(
        "0x1111111111111111111111111111111111111111111111111111111111111111",
      ),
    ).toBe(true);
  });

  it("rejects invalid hashes", () => {
    expect(isValidTxHash("0x123")).toBe(false);
    expect(isValidTxHash("abc")).toBe(false);
    expect(getHashValidationError("not-a-hash")).toBe(
      "That doesn't look like a valid transaction hash.",
    );
  });

  it("validates chains", () => {
    expect(isSupportedChain("ethereum")).toBe(true);
    expect(isSupportedChain("base")).toBe(true);
    expect(isSupportedChain("solana")).toBe(false);
  });
});

describe("format", () => {
  it("formats token amounts readably", () => {
    expect(formatTokenAmount("1000")).toBe("1,000");
    expect(formatTokenAmount("0.21")).toBe("0.21");
  });

  it("shortens addresses", () => {
    expect(
      formatAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f44e8E"),
    ).toBe("0x742d...4e8E");
  });
});
