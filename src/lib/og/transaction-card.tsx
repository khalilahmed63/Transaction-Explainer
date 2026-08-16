import { ImageResponse } from "next/og";
import { APP_NAME } from "@/config/app";
import type { TransactionType } from "@/types/transaction";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const TYPE_LABELS: Record<TransactionType, string> = {
  native_transfer: "Native Transfer",
  token_transfer: "Token Transfer",
  token_approval: "Approval",
  token_swap: "Swap",
  token_claim: "Claim",
  contract_interaction: "Contract",
  unknown: "Transaction",
};

/** Strip markdown emphasis used in on-page summaries. */
export function plainSummary(summary: string): string {
  return summary.replace(/\*\*/g, "").trim();
}

export function transactionTypeLabel(type: TransactionType): string {
  return TYPE_LABELS[type] ?? "Transaction";
}

export function truncateSummary(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function renderStaticOgImage(altHeadline = "Understand any crypto transaction.") {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, #9362f4 0%, #6d4ae8 45%, #0092f9 100%)",
          color: "#fafcff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            TX
          </div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>{APP_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            {altHeadline}
          </div>
          <div
            style={{
              fontSize: 26,
              opacity: 0.9,
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            Paste an EVM transaction hash and see transfers, swaps, approvals,
            and fees in plain English.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            fontSize: 18,
            opacity: 0.85,
          }}
        >
          <span>Major EVM networks</span>
          <span>·</span>
          <span>No wallet required</span>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

export function renderTransactionOgImage(input: {
  chainName: string;
  typeLabel: string;
  summary: string;
}) {
  const summary = truncateSummary(plainSummary(input.summary));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, #9362f4 0%, #6d4ae8 45%, #0092f9 100%)",
          color: "#fafcff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              TX
            </div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{APP_NAME}</div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              fontSize: 20,
              opacity: 0.9,
            }}
          >
            <span
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
              }}
            >
              {input.chainName}
            </span>
            <span
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
              }}
            >
              {input.typeLabel}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 22,
              opacity: 0.8,
              fontWeight: 500,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Transaction explained
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {summary}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 20, opacity: 0.85 }}>
          Plain-English blockchain explanations
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
