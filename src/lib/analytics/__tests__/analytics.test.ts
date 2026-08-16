import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const trackMock = vi.fn();

vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => trackMock(...args),
}));

describe("trackEvent", () => {
  afterEach(() => {
    trackMock.mockReset();
    vi.resetModules();
  });

  it("forwards typed events to the analytics provider", async () => {
    const { trackEvent } = await import("@/lib/analytics/analytics");

    trackEvent("network_selected", { chain: "base" });
    trackEvent("example_transaction_clicked", { chain: "ethereum" });
    trackEvent("transaction_submitted", {
      chain: "ethereum",
      source: "manual",
    });
    trackEvent("transaction_success", {
      chain: "base",
      transactionType: "token_transfer",
      source: "direct_link",
    });
    trackEvent("transaction_error", {
      chain: "ethereum",
      errorType: "not_found",
      source: "example",
    });

    expect(trackMock).toHaveBeenCalledTimes(5);
    expect(trackMock).toHaveBeenCalledWith("network_selected", {
      chain: "base",
    });
    expect(trackMock).toHaveBeenCalledWith("transaction_success", {
      chain: "base",
      transactionType: "token_transfer",
      source: "direct_link",
    });

    for (const [, properties] of trackMock.mock.calls) {
      expect(properties).not.toHaveProperty("hash");
      expect(JSON.stringify(properties)).not.toMatch(/0x[a-fA-F0-9]{64}/);
    }
  });

  it("swallows provider failures", async () => {
    trackMock.mockImplementationOnce(() => {
      throw new Error("analytics down");
    });
    const { trackEvent } = await import("@/lib/analytics/analytics");
    expect(() =>
      trackEvent("network_selected", { chain: "ethereum" }),
    ).not.toThrow();
  });
});

describe("transaction source", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => store.clear(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("defaults to direct_link and consumes stored sources", async () => {
    const {
      consumeTransactionSource,
      setTransactionSource,
    } = await import("@/lib/analytics/source");

    expect(consumeTransactionSource()).toBe("direct_link");

    setTransactionSource("example");
    expect(consumeTransactionSource()).toBe("example");
    expect(consumeTransactionSource()).toBe("direct_link");

    setTransactionSource("manual");
    expect(consumeTransactionSource()).toBe("manual");
  });
});
