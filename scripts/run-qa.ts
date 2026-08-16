/**
 * One-off CLI runner for internal QA fixtures.
 * Usage: npx tsx --env-file=.env.local scripts/run-qa.ts
 */
import {
  QA_CASES,
  QA_CONCURRENCY,
  getBlockchainQaCases,
  type QACase,
} from "../src/config/qa-cases";
import { runQaCase, type QACaseRunResult } from "../src/lib/qa/runner";

async function mapPool(
  items: QACase[],
  concurrency: number,
  worker: (item: QACase) => Promise<QACaseRunResult>,
): Promise<QACaseRunResult[]> {
  const results: QACaseRunResult[] = new Array(items.length);
  let index = 0;

  async function run() {
    while (index < items.length) {
      const current = index;
      index += 1;
      const qaCase = items[current];
      results[current] = await worker(qaCase);
      console.log(
        `[${current + 1}/${items.length}] ${qaCase.id}: ${results[current].verdict.toUpperCase()}`,
      );
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => run()),
  );
  return results;
}

async function main() {
  const onlyReal = process.argv.includes("--real");
  const cases = onlyReal ? getBlockchainQaCases() : QA_CASES;

  console.log(
    `Running ${cases.length} QA cases (concurrency ${QA_CONCURRENCY})…\n`,
  );

  const results = await mapPool(cases, QA_CONCURRENCY, (c) => runQaCase(c));

  const passed = results.filter((r) => r.verdict === "pass");
  const warnings = results.filter((r) => r.verdict === "warning");
  const failed = results.filter((r) => r.verdict === "fail");

  console.log("\n========== QA REPORT ==========");
  console.log(`Passed: ${passed.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Failed: ${failed.length}`);

  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings) {
      console.log(`\n--- ${w.caseId} ---`);
      console.log(w.reason);
    }
  }

  if (failed.length) {
    console.log("\nFailures requiring investigation:");
    for (const f of failed) {
      console.log(`\n--- ${f.caseId} ---`);
      console.log(f.reason);
      console.log("Actual summary:", JSON.stringify(f.actualSummary, null, 2));
    }
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
