import { describe, expect, it } from "vitest";
import {
  EXAMPLE_TRANSACTIONS,
  getExampleTransaction,
  getSiteUrl,
  APP_CONFIG,
} from "@/config/app";

describe("example transactions", () => {
  it("provides configured examples for ethereum and base", () => {
    const eth = getExampleTransaction("ethereum");
    const base = getExampleTransaction("base");

    expect(eth?.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(base?.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(eth?.hash).toBe(EXAMPLE_TRANSACTIONS.ethereum?.hash);
    expect(base?.hash).toBe(EXAMPLE_TRANSACTIONS.base?.hash);
  });

  it("supports all seven chain examples when configured", () => {
    for (const chain of [
      "ethereum",
      "base",
      "arbitrum",
      "polygon",
      "bsc",
      "optimism",
      "avalanche",
    ] as const) {
      const example = getExampleTransaction(chain);
      expect(example?.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    }
  });

  it("treats blank hashes as missing examples", () => {
    expect(Boolean("".trim())).toBe(false);
    expect(Boolean("  ".trim())).toBe(false);
    expect(getExampleTransaction("ethereum")).not.toBeNull();
  });
});

describe("site url", () => {
  it("defaults to APP_CONFIG.url production domain", () => {
    expect(APP_CONFIG.url).toBe("https://tx.tomnitive.com");
    expect(getSiteUrl()).toBe("https://tx.tomnitive.com");
  });
});
