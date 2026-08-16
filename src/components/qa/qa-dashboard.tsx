"use client";

import { useCallback, useMemo, useState } from "react";
import type { SupportedChain } from "@/types/transaction";
import {
  QA_CONCURRENCY,
  chainFilterLabel,
} from "@/config/qa-cases";
import { CHAIN_ORDER, CHAIN_CONFIG } from "@/lib/blockchain/chains";

type CaseMeta = {
  id: string;
  name: string;
  chain: SupportedChain | null;
  chainLabel: string;
  hash: string;
  category: string;
  kind: "blockchain" | "synthetic_error";
  expected: {
    status?: string;
    type?: string;
    allowedTypes?: string[];
    nativeSymbol?: string;
  };
};

type RunStatus = "not_run" | "running" | "pass" | "fail" | "warning";

type CaseResultPayload = {
  caseId: string;
  verdict: "pass" | "fail" | "warning";
  durationMs: number;
  reason: string;
  explanation?: {
    summary: string;
    status: string;
    transactionType: string;
    gas: { symbol: string };
    walletImpact: {
      sent: { amount: string; symbol: string }[];
      received: { amount: string; symbol: string }[];
    };
    tokenTransfers: { amount: string; symbol: string }[];
    explorerUrl: string;
  };
  error?: { code: string; message: string };
  expectedSummary: {
    status?: string;
    type?: string;
    allowedTypes?: string[];
  };
  actualSummary: {
    status?: string;
    type?: string;
    nativeSymbol?: string;
    sent?: string;
    received?: string;
    approval?: boolean;
    unlimitedApproval?: boolean;
  };
};

type RowState = {
  status: RunStatus;
  result?: CaseResultPayload;
};

type FilterKey = "all" | SupportedChain | "errors";

type QaDashboardProps = {
  cases: CaseMeta[];
  realCaseCount: number;
  networkCount: number;
};

const STATUS_STYLES: Record<RunStatus, string> = {
  not_run: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  running: "bg-sky-200 text-sky-900 dark:bg-sky-900 dark:text-sky-100",
  pass: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100",
  fail: "bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-100",
  warning: "bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-100",
};

const STATUS_LABEL: Record<RunStatus, string> = {
  not_run: "NOT RUN",
  running: "RUNNING",
  pass: "PASS",
  fail: "FAIL",
  warning: "WARNING",
};

function displayChain(meta: CaseMeta): string {
  if (meta.chain) return chainFilterLabel(meta.chain);
  return meta.chainLabel;
}

async function fetchCaseResult(caseId: string): Promise<CaseResultPayload> {
  const res = await fetch("/api/internal/qa/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId }),
  });
  if (res.status === 404) {
    throw new Error("QA API returned 404 — is ENABLE_INTERNAL_QA set?");
  }
  const json = (await res.json()) as {
    ok: boolean;
    result?: CaseResultPayload;
    error?: string;
  };
  if (!json.ok || !json.result) {
    throw new Error(json.error ?? "QA run failed");
  }
  return json.result;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  let done = 0;

  async function runOne() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
      done += 1;
      onProgress?.(done, items.length);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runOne(),
  );
  await Promise.all(runners);
  return results;
}

export function QaDashboard({
  cases,
  realCaseCount,
  networkCount,
}: QaDashboardProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(cases.map((c) => [c.id, { status: "not_run" as const }])),
  );
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return cases;
    if (filter === "errors") {
      return cases.filter((c) => c.kind === "synthetic_error");
    }
    return cases.filter((c) => c.chain === filter);
  }, [cases, filter]);

  const counts = useMemo(() => {
    let passed = 0;
    let warnings = 0;
    let failed = 0;
    let notRun = 0;
    let running = 0;
    for (const c of cases) {
      const s = rows[c.id]?.status ?? "not_run";
      if (s === "pass") passed += 1;
      else if (s === "warning") warnings += 1;
      else if (s === "fail") failed += 1;
      else if (s === "running") running += 1;
      else notRun += 1;
    }
    return { passed, warnings, failed, notRun, running };
  }, [cases, rows]);

  const setRow = useCallback((id: string, state: RowState) => {
    setRows((prev) => ({ ...prev, [id]: state }));
  }, []);

  const runOne = useCallback(
    async (caseId: string) => {
      setRow(caseId, { status: "running" });
      try {
        const result = await fetchCaseResult(caseId);
        setRow(caseId, { status: result.verdict, result });
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown QA runner error";
        const result: CaseResultPayload = {
          caseId,
          verdict: "fail",
          durationMs: 0,
          reason: `FAILED\n\nrunner\nExpected:\nsuccessful API response\n\nActual:\n${message}`,
          expectedSummary: {},
          actualSummary: {},
        };
        setRow(caseId, { status: "fail", result });
        return result;
      }
    },
    [setRow],
  );

  const runMany = useCallback(
    async (ids: string[]) => {
      if (!ids.length || busy) return;
      setBusy(true);
      setProgress({ done: 0, total: ids.length });
      try {
        await mapPool(ids, QA_CONCURRENCY, async (id) => runOne(id), (done, total) => {
          setProgress({ done, total });
        });
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [busy, runOne],
  );

  const runAllFiltered = () => runMany(filtered.map((c) => c.id));
  const runFailed = () =>
    runMany(cases.filter((c) => rows[c.id]?.status === "fail").map((c) => c.id));
  const runWarnings = () =>
    runMany(
      cases.filter((c) => rows[c.id]?.status === "warning").map((c) => c.id),
    );

  const copyHash = async (id: string, hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    ...CHAIN_ORDER.map((c) => ({
      key: c as FilterKey,
      label: chainFilterLabel(c),
    })),
    { key: "errors", label: "Error handling" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 font-mono text-sm sm:px-6">
      <header className="space-y-2 border-b border-border pb-4">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">
          Transaction Explainer QA
        </h1>
        <p className="text-muted-foreground">
          {realCaseCount} Real Transactions · {networkCount} Networks ·{" "}
          {cases.length - realCaseCount} Synthetic error cases
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-xs sm:text-sm">
          <span>Passed: {counts.passed}</span>
          <span>Warnings: {counts.warnings}</span>
          <span>Failed: {counts.failed}</span>
          <span>Not Run: {counts.notRun}</span>
          {counts.running > 0 ? <span>Running: {counts.running}</span> : null}
        </div>
        {progress ? (
          <p className="text-sky-700 dark:text-sky-300">
            Running {progress.done} / {progress.total}
          </p>
        ) : null}
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={runAllFiltered}
          className="rounded border border-border bg-foreground px-3 py-1.5 text-background disabled:opacity-50"
        >
          Run All Tests
        </button>
        <button
          type="button"
          disabled={busy || counts.failed === 0}
          onClick={runFailed}
          className="rounded border border-border px-3 py-1.5 disabled:opacity-50"
        >
          Run Failed Tests
        </button>
        <button
          type="button"
          disabled={busy || counts.warnings === 0}
          onClick={runWarnings}
          className="rounded border border-border px-3 py-1.5 disabled:opacity-50"
        >
          Run Warnings Again
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded px-2.5 py-1 text-xs ${
              filter === f.key
                ? "bg-foreground text-background"
                : "border border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Chain</th>
              <th className="px-3 py-2">Scenario</th>
              <th className="px-3 py-2">Expected</th>
              <th className="px-3 py-2">Actual</th>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((meta) => {
              const row = rows[meta.id] ?? { status: "not_run" as const };
              const result = row.result;
              const resultHref =
                meta.chain && meta.kind === "blockchain"
                  ? `/tx/${meta.chain}/${meta.hash}?qa=1`
                  : null;
              const explorerHref =
                result?.explanation?.explorerUrl ??
                (meta.chain
                  ? CHAIN_CONFIG[meta.chain].explorerTxPath(meta.hash)
                  : undefined);

              return (
                <tr
                  key={meta.id}
                  className="border-t border-border align-top hover:bg-muted/30"
                >
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[row.status]}`}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {displayChain(meta)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-sans text-sm font-medium">
                      {meta.name}
                    </div>
                    <div className="mt-1 max-w-[220px] truncate text-[11px] text-muted-foreground">
                      {meta.hash}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {meta.category}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[11px] leading-relaxed">
                    <div>status: {meta.expected.status ?? "—"}</div>
                    <div>type: {meta.expected.type ?? "—"}</div>
                    {meta.expected.allowedTypes?.length ? (
                      <div>
                        allowed: {meta.expected.allowedTypes.join(", ")}
                      </div>
                    ) : null}
                    {meta.expected.nativeSymbol ? (
                      <div>gas: {meta.expected.nativeSymbol}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-[11px] leading-relaxed">
                    {result ? (
                      <>
                        <div>
                          status: {result.actualSummary.status ?? "—"}
                        </div>
                        <div>type: {result.actualSummary.type ?? "—"}</div>
                        <div>
                          gas: {result.actualSummary.nativeSymbol ?? "—"}
                        </div>
                        <div>sent: {result.actualSummary.sent ?? "—"}</div>
                        <div>
                          received: {result.actualSummary.received ?? "—"}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {result ? `${result.durationMs} ms` : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runOne(meta.id)}
                        className="rounded border border-border px-2 py-1 text-left text-[11px] disabled:opacity-50"
                      >
                        Run Test
                      </button>
                      {resultHref ? (
                        <a
                          href={resultHref}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded border border-border px-2 py-1 text-[11px] underline-offset-2 hover:underline"
                        >
                          View Result
                        </a>
                      ) : null}
                      {explorerHref ? (
                        <a
                          href={explorerHref}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded border border-border px-2 py-1 text-[11px] underline-offset-2 hover:underline"
                        >
                          View on Explorer
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => copyHash(meta.id, meta.hash)}
                        className="rounded border border-border px-2 py-1 text-left text-[11px]"
                      >
                        {copiedId === meta.id ? "Copied" : "Copy Hash"}
                      </button>
                      {result?.reason ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded(expanded === meta.id ? null : meta.id)
                          }
                          className="rounded border border-border px-2 py-1 text-left text-[11px]"
                        >
                          {expanded === meta.id
                            ? "Hide Details"
                            : "Failure Details"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.map((meta) => {
        const result = rows[meta.id]?.result;
        if (!result || expanded !== meta.id) return null;
        const expl = result.explanation;
        return (
          <section
            key={`${meta.id}-detail`}
            className="space-y-3 rounded border border-border p-4"
          >
            <h2 className="font-sans text-base font-semibold">
              {meta.name} — details
            </h2>
            {result.reason ? (
              <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-muted/40 p-3 text-xs">
                {result.reason}
              </pre>
            ) : null}
            {expl ? (
              <div className="grid gap-3 text-xs sm:grid-cols-2">
                <div>
                  <div className="mb-1 font-semibold">Explanation</div>
                  <p className="whitespace-pre-wrap font-sans text-sm">
                    {expl.summary}
                  </p>
                </div>
                <div>
                  <div className="mb-1 font-semibold">Wallet impact</div>
                  <div>
                    sent:{" "}
                    {expl.walletImpact.sent
                      .map((a) => `${a.amount} ${a.symbol}`)
                      .join(", ") || "none"}
                  </div>
                  <div>
                    received:{" "}
                    {expl.walletImpact.received
                      .map((a) => `${a.amount} ${a.symbol}`)
                      .join(", ") || "none"}
                  </div>
                  <div className="mt-2 font-semibold">Token movements</div>
                  <div>
                    {expl.tokenTransfers
                      .map((t) => `${t.amount} ${t.symbol}`)
                      .join(", ") || "none"}
                  </div>
                  <div className="mt-2">Gas symbol: {expl.gas.symbol}</div>
                </div>
              </div>
            ) : result.error ? (
              <div className="text-xs">
                Error: {result.error.code} — {result.error.message}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
