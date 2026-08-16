import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Hash } from "viem";
import { TransactionResult } from "@/components/transaction/transaction-result";
import { TransactionError } from "@/components/transaction/transaction-error";
import { TransactionSearch } from "@/components/transaction/transaction-search";
import { TransactionAnalytics } from "@/components/transaction/transaction-analytics";
import {
  explainTransaction,
  RpcRequestError,
  TransactionNotFoundError,
} from "@/lib/blockchain/fetch-transaction";
import { findAlternateChain } from "@/lib/blockchain/resolve-chain";
import { getChainConfig } from "@/lib/blockchain/chains";
import { APP_NAME } from "@/config/app";
import { plainSummary } from "@/lib/og/transaction-card";
import {
  isSupportedChain,
  isValidTxHash,
  normalizeHash,
} from "@/lib/validation/transaction";
import type { SupportedChain, TransactionExplanation } from "@/types/transaction";
import type { TransactionErrorType } from "@/lib/analytics";

type PageProps = {
  params: Promise<{ chain: string; hash: string }>;
  searchParams: Promise<{ qa?: string }>;
};

function isQaTraffic(searchParams: { qa?: string }): boolean {
  return searchParams.qa === "1" || searchParams.qa === "true";
}

type LoadResult =
  | { ok: true; data: TransactionExplanation }
  | {
      ok: false;
      kind: "not_found" | "rpc" | "unconfigured" | "internal";
      message: string;
    };

function errorTypeFromKind(
  kind: "not_found" | "rpc" | "unconfigured" | "internal",
): TransactionErrorType {
  switch (kind) {
    case "not_found":
      return "not_found";
    case "rpc":
    case "unconfigured":
      return "rpc_error";
    case "internal":
      return "internal_error";
    default:
      return "unknown";
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { chain, hash } = await params;
  const chainName = isSupportedChain(chain)
    ? getChainConfig(chain).name
    : "Crypto";

  const canonicalPath =
    isSupportedChain(chain) && isValidTxHash(hash)
      ? `/tx/${chain}/${normalizeHash(hash)}`
      : undefined;

  let description = `Plain-English explanation of a ${chainName} transaction.`;

  if (isSupportedChain(chain) && isValidTxHash(hash)) {
    try {
      const data = await explainTransaction(
        chain,
        normalizeHash(hash) as Hash,
      );
      description = plainSummary(data.summary);
    } catch {
      // Keep generic description on failure.
    }
  }

  return {
    title: `${chainName} Transaction Explained`,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: canonicalPath
      ? {
          canonical: canonicalPath,
        }
      : undefined,
    openGraph: {
      title: `${chainName} Transaction Explained | ${APP_NAME}`,
      description,
      type: "website",
      ...(canonicalPath ? { url: canonicalPath } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${chainName} Transaction Explained`,
      description,
    },
  };
}

async function loadExplanation(
  chain: SupportedChain,
  hash: Hash,
): Promise<LoadResult> {
  try {
    const data = await explainTransaction(chain, hash);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof TransactionNotFoundError) {
      return {
        ok: false,
        kind: "not_found",
        message: `We couldn't find this transaction on ${getChainConfig(chain).name}.`,
      };
    }
    if (error instanceof Error && error.message.includes("is not configured")) {
      return {
        ok: false,
        kind: "unconfigured",
        message:
          "Blockchain RPC is not configured. Set the network RPC URL environment variables to enable explanations.",
      };
    }
    if (error instanceof RpcRequestError) {
      return {
        ok: false,
        kind: "rpc",
        message:
          "We couldn't reach the blockchain network right now. Please try again shortly.",
      };
    }
    console.error("[tx page]", error);
    return {
      ok: false,
      kind: "internal",
      message: "Something went wrong while explaining this transaction.",
    };
  }
}

export default async function TransactionPage({
  params,
  searchParams,
}: PageProps) {
  const { chain: chainParam, hash: hashParam } = await params;
  const qaMode = isQaTraffic(await searchParams);

  if (!isSupportedChain(chainParam)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <TransactionError
          title="Unsupported network"
          message="Please choose a supported network: Ethereum, Base, Arbitrum, Polygon, BNB Chain, Optimism, or Avalanche."
        />
      </div>
    );
  }

  const chain = chainParam;

  if (!isValidTxHash(hashParam)) {
    return (
      <div className="mx-auto max-w-2xl space-y-10 px-4 py-12 sm:px-6">
        {!qaMode ? (
          <TransactionAnalytics
            chain={chain}
            outcome="error"
            errorType="invalid_transaction"
            submitted={false}
          />
        ) : null}
        <TransactionSearch defaultChain={chain} clearHref="/" />
        <TransactionError
          title="Invalid transaction hash"
          message="That doesn't look like a valid transaction hash."
          chain={chain}
          reasons={[
            "transaction hashes start with 0x",
            "they are 66 characters long",
            "they contain only hexadecimal characters",
          ]}
        />
      </div>
    );
  }

  const hash = normalizeHash(hashParam) as Hash;
  const result = await loadExplanation(chain, hash);

  if (result.ok) {
    return (
      <div className="mx-auto max-w-2xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        {!qaMode ? (
          <TransactionAnalytics
            chain={chain}
            outcome="success"
            transactionType={result.data.transactionType}
          />
        ) : null}
        <TransactionSearch
          defaultChain={chain}
          defaultHash={result.data.hash}
          clearHref="/"
        />
        <div className="border-t border-border pt-10">
          <TransactionResult tx={result.data} />
        </div>
      </div>
    );
  }

  if (result.kind === "not_found") {
    // Common case: pasted a Base hash while Ethereum is selected (or vice versa).
    const alternate = await findAlternateChain(chain, hash);
    if (alternate) {
      redirect(`/tx/${alternate}/${hash}${qaMode ? "?qa=1" : ""}`);
    }

    return (
      <div className="mx-auto max-w-2xl space-y-10 px-4 py-12 sm:px-6">
        {!qaMode ? (
          <TransactionAnalytics
            chain={chain}
            outcome="error"
            errorType={errorTypeFromKind(result.kind)}
          />
        ) : null}
        <TransactionSearch
          defaultChain={chain}
          defaultHash={hash}
          clearHref="/"
        />
        <TransactionError
          title="Transaction not found"
          message={result.message}
          chain={chain}
          hash={hash}
        />
      </div>
    );
  }

  if (result.kind === "unconfigured") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {!qaMode ? (
          <TransactionAnalytics
            chain={chain}
            outcome="error"
            errorType={errorTypeFromKind(result.kind)}
          />
        ) : null}
        <TransactionError
          title="Service unavailable"
          message={result.message}
          reasons={[]}
        />
      </div>
    );
  }

  if (result.kind === "rpc") {
    return (
      <div className="mx-auto max-w-2xl space-y-10 px-4 py-12 sm:px-6">
        {!qaMode ? (
          <TransactionAnalytics
            chain={chain}
            outcome="error"
            errorType={errorTypeFromKind(result.kind)}
          />
        ) : null}
        <TransactionSearch
          defaultChain={chain}
          defaultHash={hash}
          clearHref="/"
        />
        <TransactionError
          title="Couldn't reach the network"
          message={result.message}
          chain={chain}
          reasons={[
            "temporary network congestion",
            "RPC provider rate limiting",
            "a brief connectivity issue",
          ]}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-4 py-12 sm:px-6">
      {!qaMode ? (
        <TransactionAnalytics
          chain={chain}
          outcome="error"
          errorType={errorTypeFromKind(result.kind)}
        />
      ) : null}
      <TransactionSearch defaultChain={chain} clearHref="/" />
      <TransactionError
        title="Something went wrong"
        message={result.message}
        chain={chain}
      />
    </div>
  );
}
