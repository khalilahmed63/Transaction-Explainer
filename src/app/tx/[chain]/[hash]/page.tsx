import type { Metadata } from "next";
import type { Hash } from "viem";
import { TransactionResult } from "@/components/transaction/transaction-result";
import { TransactionError } from "@/components/transaction/transaction-error";
import { TransactionSearch } from "@/components/transaction/transaction-search";
import {
  explainTransaction,
  RpcRequestError,
  TransactionNotFoundError,
} from "@/lib/blockchain/fetch-transaction";
import { getChainConfig } from "@/lib/blockchain/chains";
import {
  isSupportedChain,
  isValidTxHash,
  normalizeHash,
} from "@/lib/validation/transaction";
import type { SupportedChain, TransactionExplanation } from "@/types/transaction";

type PageProps = {
  params: Promise<{ chain: string; hash: string }>;
};

type LoadResult =
  | { ok: true; data: TransactionExplanation }
  | {
      ok: false;
      kind: "not_found" | "rpc" | "unconfigured" | "internal";
      message: string;
    };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { chain } = await params;
  const chainName = isSupportedChain(chain)
    ? getChainConfig(chain).name
    : "Crypto";

  return {
    title: `${chainName} Transaction Explained`,
    description: `Plain-English explanation of a ${chainName} transaction.`,
    robots: {
      index: false,
      follow: true,
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
          "Blockchain RPC is not configured. Set ETHEREUM_RPC_URL and BASE_RPC_URL to enable explanations.",
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

export default async function TransactionPage({ params }: PageProps) {
  const { chain: chainParam, hash: hashParam } = await params;

  if (!isSupportedChain(chainParam)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <TransactionError
          title="Unsupported network"
          message="Please choose Ethereum or Base."
        />
      </div>
    );
  }

  const chain = chainParam;

  if (!isValidTxHash(hashParam)) {
    return (
      <div className="mx-auto max-w-2xl space-y-10 px-4 py-12 sm:px-6">
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
        <TransactionSearch defaultChain={chain} />
      </div>
    );
  }

  const hash = normalizeHash(hashParam) as Hash;
  const result = await loadExplanation(chain, hash);

  if (result.ok) {
    return (
      <div className="mx-auto max-w-2xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Explain another transaction
          </h2>
          <TransactionSearch
            defaultChain={chain}
            defaultHash={result.data.hash}
          />
        </div>
        <div className="border-t border-border pt-10">
          <TransactionResult tx={result.data} />
        </div>
      </div>
    );
  }

  if (result.kind === "not_found") {
    return (
      <div className="mx-auto max-w-2xl space-y-10 px-4 py-12 sm:px-6">
        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Explain another transaction
          </h2>
          <TransactionSearch defaultChain={chain} defaultHash={hash} />
        </div>
        <TransactionError
          title="Transaction not found"
          message={result.message}
          chain={chain}
        />
      </div>
    );
  }

  if (result.kind === "unconfigured") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
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
        <TransactionSearch defaultChain={chain} defaultHash={hash} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <TransactionError
        title="Something went wrong"
        message={result.message}
        chain={chain}
      />
    </div>
  );
}
