import type { Hash } from "viem";
import type {
  ApiErrorCode,
  ApiResponse,
  TransactionExplanation,
} from "@/types/transaction";
import {
  getQaCaseById,
  type QABlockchainCase,
  type QACase,
  type QASyntheticErrorCase,
} from "@/config/qa-cases";
import {
  analyzeTransaction,
  RpcRequestError,
  TransactionNotFoundError,
} from "@/lib/blockchain/fetch-transaction";
import { getChainConfig } from "@/lib/blockchain/chains";
import {
  isSupportedChain,
  isValidTxHash,
  normalizeHash,
} from "@/lib/validation/transaction";
import {
  assertExplanation,
  formatFailureBlock,
  type QAVerdict,
} from "./assert";

export type QACaseRunResult = {
  caseId: string;
  verdict: QAVerdict;
  durationMs: number;
  reason: string;
  explanation?: TransactionExplanation;
  error?: {
    code: ApiErrorCode;
    message: string;
  };
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

function mapAnalyzeError(error: unknown, chain: string): {
  code: ApiErrorCode;
  message: string;
} {
  if (error instanceof TransactionNotFoundError) {
    const name = isSupportedChain(chain)
      ? getChainConfig(chain).name
      : chain;
    return {
      code: "not_found",
      message: `We couldn't find this transaction on ${name}.`,
    };
  }

  if (error instanceof RpcRequestError) {
    return {
      code: "rpc_error",
      message:
        "We couldn't reach the blockchain network right now. Please try again shortly.",
    };
  }

  if (error instanceof Error && error.message.includes("is not configured")) {
    return {
      code: "rpc_error",
      message:
        "Blockchain RPC is not configured. Set the network RPC URL environment variables.",
    };
  }

  console.error("[qa/runner]", error);
  return {
    code: "internal_error",
    message: "Something went wrong while explaining this transaction.",
  };
}

/**
 * Same user-facing error mapping as the public `/api/transaction` route.
 */
export function explainViaProductionPath(
  chain: string,
  hash: string,
): Promise<ApiResponse> {
  if (!isSupportedChain(chain)) {
    return Promise.resolve({
      ok: false,
      error: {
        code: "invalid_chain",
        message: "Please choose a supported network.",
      },
    });
  }

  if (!isValidTxHash(hash)) {
    return Promise.resolve({
      ok: false,
      error: {
        code: "invalid_hash",
        message: "That doesn't look like a valid transaction hash.",
      },
    });
  }

  const normalized = normalizeHash(hash) as Hash;
  return analyzeTransaction(chain, normalized)
    .then((data): ApiResponse => ({ ok: true, data }))
    .catch((error): ApiResponse => ({
      ok: false,
      error: mapAnalyzeError(error, chain),
    }));
}

function assetListSummary(
  items: { amount: string; symbol: string }[],
): string {
  if (!items.length) return "none";
  return items.map((a) => `${a.amount} ${a.symbol}`).join(", ");
}

async function runBlockchainCase(
  qaCase: QABlockchainCase,
): Promise<QACaseRunResult> {
  const started = Date.now();
  const expectedSummary = {
    status: qaCase.expected.status,
    type: qaCase.expected.type,
    allowedTypes: qaCase.expected.allowedTypes,
  };

  try {
    const response = await explainViaProductionPath(qaCase.chain, qaCase.hash);
    const durationMs = Date.now() - started;

    if (!response.ok) {
      if (qaCase.expected.mustNotCrash) {
        return {
          caseId: qaCase.id,
          verdict: "fail",
          durationMs,
          reason: `FAILED\n\nmustNotCrash\nExpected:\nanalysis succeeds\n\nActual:\n${response.error.code}: ${response.error.message}`,
          error: response.error,
          expectedSummary,
          actualSummary: {},
        };
      }
      return {
        caseId: qaCase.id,
        verdict: "fail",
        durationMs,
        reason: `FAILED\n\nanalyzer error\nExpected:\nsuccessful explanation\n\nActual:\n${response.error.code}: ${response.error.message}`,
        error: response.error,
        expectedSummary,
        actualSummary: {},
      };
    }

    const explanation = response.data;
    const assertion = assertExplanation(qaCase.expected, explanation);

    return {
      caseId: qaCase.id,
      verdict: assertion.verdict,
      durationMs,
      reason: formatFailureBlock(assertion),
      explanation,
      expectedSummary,
      actualSummary: {
        status: explanation.status,
        type: explanation.transactionType,
        nativeSymbol: explanation.gas.symbol,
        sent: assetListSummary(explanation.walletImpact.sent),
        received: assetListSummary(explanation.walletImpact.received),
        approval: explanation.approvals.length > 0,
        unlimitedApproval: explanation.approvals.some((a) => a.isUnlimited),
      },
    };
  } catch (error) {
    const durationMs = Date.now() - started;
    const mapped = mapAnalyzeError(error, qaCase.chain);
    return {
      caseId: qaCase.id,
      verdict: "fail",
      durationMs,
      reason: `FAILED\n\nunhandled crash\nExpected:\nmustNotCrash / clean error\n\nActual:\n${mapped.code}: ${mapped.message}`,
      error: mapped,
      expectedSummary,
      actualSummary: {},
    };
  }
}

async function runSyntheticErrorCase(
  qaCase: QASyntheticErrorCase,
): Promise<QACaseRunResult> {
  const started = Date.now();
  const expectedSummary = {
    status: `error:${qaCase.expectedError.code}`,
  };

  let response: ApiResponse;

  if (qaCase.simulateRpcFailure) {
    response = {
      ok: false,
      error: mapAnalyzeError(
        new RpcRequestError("simulated RPC outage"),
        qaCase.input.chain,
      ),
    };
  } else {
    response = await explainViaProductionPath(
      qaCase.input.chain,
      qaCase.input.hash,
    );
  }

  const durationMs = Date.now() - started;

  if (response.ok) {
    return {
      caseId: qaCase.id,
      verdict: "fail",
      durationMs,
      reason: `FAILED\n\nerror handling\nExpected:\n${qaCase.expectedError.code}\n\nActual:\nsuccess (${response.data.transactionType})`,
      explanation: response.data,
      expectedSummary,
      actualSummary: {
        status: response.data.status,
        type: response.data.transactionType,
      },
    };
  }

  const issues: string[] = [];
  if (response.error.code !== qaCase.expectedError.code) {
    issues.push(
      `error code\nExpected:\n${qaCase.expectedError.code}\n\nActual:\n${response.error.code}`,
    );
  }
  if (
    qaCase.expectedError.messageIncludes &&
    !response.error.message
      .toLowerCase()
      .includes(qaCase.expectedError.messageIncludes.toLowerCase())
  ) {
    issues.push(
      `error message\nExpected to include:\n${qaCase.expectedError.messageIncludes}\n\nActual:\n${response.error.message}`,
    );
  }

  if (issues.length) {
    return {
      caseId: qaCase.id,
      verdict: "fail",
      durationMs,
      reason: `FAILED\n\n${issues.join("\n\n")}`,
      error: response.error,
      expectedSummary,
      actualSummary: {
        status: `error:${response.error.code}`,
      },
    };
  }

  return {
    caseId: qaCase.id,
    verdict: "pass",
    durationMs,
    reason: "",
    error: response.error,
    expectedSummary,
    actualSummary: {
      status: `error:${response.error.code}`,
    },
  };
}

export async function runQaCase(qaCase: QACase): Promise<QACaseRunResult> {
  if (qaCase.kind === "blockchain") {
    return runBlockchainCase(qaCase);
  }
  return runSyntheticErrorCase(qaCase);
}

export async function runQaCaseById(
  caseId: string,
): Promise<QACaseRunResult | null> {
  const qaCase = getQaCaseById(caseId);
  if (!qaCase) return null;
  return runQaCase(qaCase);
}
