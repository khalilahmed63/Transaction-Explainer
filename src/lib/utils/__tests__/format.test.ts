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

  it("extracts hashes from explorer URLs and detects chain hints", async () => {
    const {
      extractTxHash,
      detectChainHintFromInput,
    } = await import("@/lib/validation/transaction");

    const hash =
      "0xd5a4dab2691e1e6374173a17597184245d2d0296804475ad1bbc0cc21b53abc8";

    expect(
      extractTxHash(`https://basescan.org/tx/${hash}`),
    ).toBe(hash);
    expect(
      detectChainHintFromInput(`https://basescan.org/tx/${hash}`),
    ).toBe("base");
    expect(
      detectChainHintFromInput(`https://etherscan.io/tx/${hash}`),
    ).toBe("ethereum");
    expect(detectChainHintFromInput(hash)).toBeNull();
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
