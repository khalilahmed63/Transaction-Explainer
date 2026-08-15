import { type Hash } from "viem";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/transaction";
import {
  explainTransaction,
  RpcRequestError,
  TransactionNotFoundError,
} from "@/lib/blockchain/fetch-transaction";
import {
  isSupportedChain,
  isValidTxHash,
  normalizeHash,
} from "@/lib/validation/transaction";
import { getChainConfig } from "@/lib/blockchain/chains";

export const runtime = "nodejs";

const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

async function handleExplain(chain: string, hash: string, ip: string) {
  if (!checkRateLimit(ip)) {
    const body: ApiResponse = {
      ok: false,
      error: {
        code: "rate_limited",
        message: "Too many requests. Please wait a moment and try again.",
      },
    };
    return NextResponse.json(body, { status: 429 });
  }

  if (!isSupportedChain(chain)) {
    const body: ApiResponse = {
      ok: false,
      error: {
        code: "invalid_chain",
        message: "Please choose Ethereum or Base.",
      },
    };
    return NextResponse.json(body, { status: 400 });
  }

  if (!isValidTxHash(hash)) {
    const body: ApiResponse = {
      ok: false,
      error: {
        code: "invalid_hash",
        message: "That doesn't look like a valid transaction hash.",
      },
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const normalized = normalizeHash(hash) as Hash;
    const data = await explainTransaction(chain, normalized);
    const body: ApiResponse = { ok: true, data };
    return NextResponse.json(body);
  } catch (error) {
    if (error instanceof TransactionNotFoundError) {
      const name = getChainConfig(chain).name;
      const body: ApiResponse = {
        ok: false,
        error: {
          code: "not_found",
          message: `We couldn't find this transaction on ${name}.`,
        },
      };
      return NextResponse.json(body, { status: 404 });
    }

    if (error instanceof RpcRequestError) {
      const body: ApiResponse = {
        ok: false,
        error: {
          code: "rpc_error",
          message:
            "We couldn't reach the blockchain network right now. Please try again shortly.",
        },
      };
      return NextResponse.json(body, { status: 502 });
    }

    if (
      error instanceof Error &&
      error.message.includes("is not configured")
    ) {
      const body: ApiResponse = {
        ok: false,
        error: {
          code: "rpc_error",
          message:
            "Blockchain RPC is not configured. Set ETHEREUM_RPC_URL and BASE_RPC_URL.",
        },
      };
      return NextResponse.json(body, { status: 503 });
    }

    console.error("[api/transaction]", error);
    const body: ApiResponse = {
      ok: false,
      error: {
        code: "internal_error",
        message: "Something went wrong while explaining this transaction.",
      },
    };
    return NextResponse.json(body, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    const body: ApiResponse = {
      ok: false,
      error: {
        code: "invalid_hash",
        message: "That doesn't look like a valid transaction hash.",
      },
    };
    return NextResponse.json(body, { status: 400 });
  }

  const { chain, hash } = (json ?? {}) as {
    chain?: string;
    hash?: string;
  };

  return handleExplain(chain ?? "", hash ?? "", ip);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get("chain") ?? "";
  const hash = searchParams.get("hash") ?? "";
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  return handleExplain(chain, hash, ip);
}
