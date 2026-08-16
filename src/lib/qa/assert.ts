import type {
  AssetMovement,
  TransactionExplanation,
  TransactionType,
} from "@/types/transaction";
import type { ExpectedAsset, QAExpectedFacts } from "@/config/qa-cases";

export type QAVerdict = "pass" | "fail" | "warning";

export type AssertionIssue = {
  severity: "fail" | "warning";
  expected: string;
  actual: string;
  label: string;
};

export type AssertionResult = {
  verdict: QAVerdict;
  issues: AssertionIssue[];
  reason: string;
};

function parseAmount(value: string): number | null {
  const cleaned = value.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function symbolMatches(actual: string, expected: ExpectedAsset): boolean {
  const candidates = [expected.symbol, ...(expected.alternateSymbols ?? [])].map(
    (s) => s.toUpperCase(),
  );
  return candidates.includes(actual.toUpperCase());
}

function amountMatches(actual: string, expected: ExpectedAsset): boolean {
  if (expected.amountApprox === undefined) return true;
  const parsed = parseAmount(actual);
  if (parsed === null) return false;

  const target = expected.amountApprox;
  const rel = expected.amountTolerance ?? 0.02;
  const absFloor = expected.amountAbsTolerance ?? Math.max(1e-8, Math.abs(target) * 1e-6);
  const allowed = Math.max(Math.abs(target) * rel, absFloor);
  return Math.abs(parsed - target) <= allowed;
}

function findAsset(
  assets: AssetMovement[],
  expected: ExpectedAsset,
): AssetMovement | undefined {
  return assets.find((a) => {
    if (!symbolMatches(a.symbol, expected)) return false;
    if (expected.isNative !== undefined && Boolean(a.isNative) !== expected.isNative) {
      return false;
    }
    return amountMatches(a.amount, expected);
  });
}

function describeAssets(assets: AssetMovement[]): string {
  if (assets.length === 0) return "none";
  return assets.map((a) => `${a.amount} ${a.symbol}`).join(", ");
}

function describeExpectedAsset(expected: ExpectedAsset): string {
  const symbols = [expected.symbol, ...(expected.alternateSymbols ?? [])].join("/");
  if (expected.amountApprox !== undefined) {
    return `~${expected.amountApprox} ${symbols}`;
  }
  return symbols;
}

function checkAssetList(
  label: string,
  actual: AssetMovement[],
  expectedList: ExpectedAsset[] | undefined,
  issues: AssertionIssue[],
) {
  if (!expectedList?.length) return;
  for (const expected of expectedList) {
    const match = findAsset(actual, expected);
    if (!match) {
      issues.push({
        severity: "fail",
        label,
        expected: describeExpectedAsset(expected),
        actual: describeAssets(actual),
      });
    }
  }
}

function typeIsAllowed(
  actual: TransactionType,
  expected: QAExpectedFacts,
): boolean {
  if (expected.type && actual === expected.type) return true;
  if (expected.allowedTypes?.includes(actual)) return true;
  return false;
}

/**
 * Compare analyzer output to stable fixture facts (not English summary text).
 */
export function assertExplanation(
  expected: QAExpectedFacts,
  actual: TransactionExplanation,
): AssertionResult {
  const issues: AssertionIssue[] = [];

  if (expected.status && actual.status !== expected.status) {
    issues.push({
      severity: "fail",
      label: "status",
      expected: expected.status,
      actual: actual.status,
    });
  }

  if (expected.nativeSymbol && actual.gas.symbol !== expected.nativeSymbol) {
    issues.push({
      severity: "fail",
      label: "native / gas symbol",
      expected: expected.nativeSymbol,
      actual: actual.gas.symbol,
    });
  }

  if (expected.minTransferCount !== undefined) {
    const count = actual.tokenTransfers.length;
    if (count < expected.minTransferCount) {
      issues.push({
        severity: "fail",
        label: "token transfer count",
        expected: `>= ${expected.minTransferCount}`,
        actual: String(count),
      });
    }
  }

  checkAssetList("sent", actual.walletImpact.sent, expected.sent, issues);
  checkAssetList("received", actual.walletImpact.received, expected.received, issues);

  if (expected.anyDirection?.length) {
    const combined = [
      ...actual.walletImpact.sent,
      ...actual.walletImpact.received,
      ...actual.tokenTransfers.map((t) => ({
        symbol: t.symbol,
        amount: t.amount,
        rawAmount: t.rawAmount,
        decimals: t.decimals,
        tokenAddress: t.tokenAddress,
        isNative: false,
      })),
    ];
    for (const asset of expected.anyDirection) {
      if (!findAsset(combined, asset)) {
        issues.push({
          severity: "fail",
          label: "token movement",
          expected: describeExpectedAsset(asset),
          actual: describeAssets(combined),
        });
      }
    }
  }

  if (expected.approval !== undefined) {
    const hasApproval = actual.approvals.length > 0;
    if (expected.approval !== hasApproval) {
      issues.push({
        severity: "fail",
        label: "approval detected",
        expected: String(expected.approval),
        actual: String(hasApproval),
      });
    }
  }

  if (expected.unlimitedApproval !== undefined) {
    const unlimited = actual.approvals.some((a) => a.isUnlimited);
    if (expected.unlimitedApproval !== unlimited) {
      issues.push({
        severity: "fail",
        label: "unlimited approval",
        expected: String(expected.unlimitedApproval),
        actual: String(unlimited),
      });
    }
  }

  if (expected.approvalTokenSymbols?.length) {
    const allowed = new Set(
      expected.approvalTokenSymbols.map((s) => s.toUpperCase()),
    );
    const symbols = actual.approvals.map((a) => a.symbol.toUpperCase());
    const ok = symbols.some((s) => allowed.has(s));
    if (!ok) {
      issues.push({
        severity: "fail",
        label: "approval token",
        expected: expected.approvalTokenSymbols.join(" / "),
        actual: symbols.length ? symbols.join(", ") : "none",
      });
    }
  }

  if (expected.noSuccessfulMovements) {
    const hasMoves =
      actual.walletImpact.sent.length > 0 ||
      actual.walletImpact.received.length > 0 ||
      actual.tokenTransfers.length > 0;
    const summaryClaimsSuccess =
      /you (sent|swapped|received|transferred)/i.test(actual.summary) &&
      !/did not complete|failed|reverted/i.test(actual.summary);

    if (hasMoves || summaryClaimsSuccess) {
      issues.push({
        severity: "fail",
        label: "failed tx movements",
        expected: "no completed token movements described",
        actual: hasMoves
          ? `sent=${describeAssets(actual.walletImpact.sent)}; received=${describeAssets(actual.walletImpact.received)}`
          : actual.summary,
      });
    }
  }

  // Type classification — preferred vs allowed vs fallback
  if (expected.type || expected.allowedTypes?.length) {
    const preferred = expected.type;
    const actualType = actual.transactionType;

    if (preferred && actualType === preferred) {
      // exact match
    } else if (typeIsAllowed(actualType, expected)) {
      if (preferred && expected.allowFallback) {
        issues.push({
          severity: "warning",
          label: "transaction type (fallback)",
          expected: `preferred ${preferred}`,
          actual: actualType,
        });
      } else if (preferred && !expected.allowedTypes?.includes(actualType)) {
        issues.push({
          severity: "fail",
          label: "transaction type",
          expected: preferred,
          actual: actualType,
        });
      }
      // allowedTypes without preferred, or preferred missing but allowed — OK / warning already
    } else if (expected.allowFallback && expected.mustNotCrash) {
      issues.push({
        severity: "warning",
        label: "transaction type (conservative fallback)",
        expected: preferred
          ? `preferred ${preferred}${expected.allowedTypes ? ` or ${expected.allowedTypes.join("|")}` : ""}`
          : expected.allowedTypes?.join(" | ") ?? "stable classification",
        actual: actualType,
      });
    } else if (preferred || expected.allowedTypes?.length) {
      issues.push({
        severity: "fail",
        label: "transaction type",
        expected:
          preferred && expected.allowedTypes?.length
            ? `${preferred} (or ${expected.allowedTypes.join(", ")})`
            : preferred ?? expected.allowedTypes!.join(", "),
        actual: actualType,
      });
    }
  }

  const fails = issues.filter((i) => i.severity === "fail");
  const warnings = issues.filter((i) => i.severity === "warning");

  if (fails.length > 0) {
    return {
      verdict: "fail",
      issues,
      reason: formatIssues(fails),
    };
  }

  if (warnings.length > 0) {
    return {
      verdict: "warning",
      issues,
      reason: formatIssues(warnings),
    };
  }

  return { verdict: "pass", issues: [], reason: "" };
}

export function formatIssues(issues: AssertionIssue[]): string {
  return issues
    .map(
      (i) =>
        `${i.label.toUpperCase()}\nExpected:\n${i.expected}\n\nActual:\n${i.actual}`,
    )
    .join("\n\n");
}

export function formatFailureBlock(result: AssertionResult): string {
  if (result.verdict === "pass") return "";
  const header = result.verdict === "fail" ? "FAILED" : "WARNING";
  return `${header}\n\n${result.reason}`;
}
