import { ImageResponse } from "next/og";
import { APP_NAME } from "@/config/app";

export const alt = `${APP_NAME} — Understand crypto transactions in plain English`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
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
            Understand any crypto transaction.
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

        <div style={{ display: "flex", gap: 12, fontSize: 18, opacity: 0.85 }}>
          <span>Major EVM networks</span>
          <span>·</span>
          <span>No wallet required</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
