import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isInternalQaEnabled } from "@/lib/qa/enabled";
import { QaDashboard } from "@/components/qa/qa-dashboard";
import {
  QA_CASES,
  QA_NETWORK_COUNT,
  QA_REAL_CASE_COUNT,
} from "@/config/qa-cases";

/** Env gate must be evaluated per request (Preview vs Production). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transaction Explainer QA",
  description: "Internal regression tests for Transaction Explainer",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function InternalQaPage() {
  if (!isInternalQaEnabled()) {
    notFound();
  }

  const cases = QA_CASES.map((c) => {
    if (c.kind === "blockchain") {
      return {
        id: c.id,
        name: c.name,
        chain: c.chain,
        chainLabel: c.chain,
        hash: c.hash,
        category: c.category,
        kind: "blockchain" as const,
        expected: {
          status: c.expected.status,
          type: c.expected.type,
          allowedTypes: c.expected.allowedTypes,
          nativeSymbol: c.expected.nativeSymbol,
        },
      };
    }
    return {
      id: c.id,
      name: c.name,
      chain: null,
      chainLabel: c.chainLabel,
      hash: c.input.hash,
      category: c.category,
      kind: "synthetic_error" as const,
      expected: {
        status: `error:${c.expectedError.code}`,
      },
    };
  });

  return (
    <QaDashboard
      cases={cases}
      realCaseCount={QA_REAL_CASE_COUNT}
      networkCount={QA_NETWORK_COUNT}
    />
  );
}
