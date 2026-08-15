import { type Hex, decodeFunctionData, formatUnits, parseAbi } from "viem";
import { formatTokenAmount } from "@/lib/utils/format";

/** Known claim-style function selectors we can recognize from calldata. */
const CLAIM_SELECTORS = new Set([
  // claim(address[] users, address[] tokens, uint256[] amounts, bytes32[][] proofs)
  "0x71ee95c0",
  // claim(uint256)
  "0x379607f5",
  // claim()
  "0x4e71d92d",
  // claim(address)
  "0x1e83409a",
  // claim(bytes32[])
  "0xabd50ed8",
  // claimReward()
  "0xb88a802f",
  // claimRewards(address)
  "0xe6f1daf2",
]);

const merkleClaimAbi = parseAbi([
  "function claim(address[] users, address[] tokens, uint256[] amounts, bytes32[][] proofs)",
]);

export type DecodedClaim = {
  users: string[];
  tokens: string[];
  amounts: bigint[];
};

export type ClaimAllocationMatch = {
  tokenAddress: string;
  allocationRaw: bigint;
  allocationAmount: string;
};

export function getMethodSelector(input: Hex | undefined): string | undefined {
  if (!input || input === "0x" || input.length < 10) return undefined;
  return input.slice(0, 10).toLowerCase();
}

export function isClaimMethod(input: Hex | undefined): boolean {
  const selector = getMethodSelector(input);
  return Boolean(selector && CLAIM_SELECTORS.has(selector));
}

export function decodeMerkleClaim(
  input: Hex | undefined,
): DecodedClaim | null {
  if (!input || getMethodSelector(input) !== "0x71ee95c0") return null;

  try {
    const decoded = decodeFunctionData({
      abi: merkleClaimAbi,
      data: input,
    });

    if (decoded.functionName !== "claim") return null;

    const [users, tokens, amounts] = decoded.args as [
      `0x${string}`[],
      `0x${string}`[],
      bigint[],
      unknown,
    ];

    return {
      users: users.map((u) => u.toLowerCase()),
      tokens: tokens.map((t) => t.toLowerCase()),
      amounts: [...amounts],
    };
  } catch {
    return null;
  }
}

/**
 * For Angle-style merkle distributors, calldata `amounts` is the full allocation.
 * The Transfer may be smaller when part was already claimed earlier.
 */
export function getClaimAllocationForRecipient(params: {
  input: Hex | undefined;
  recipient: string;
  tokenAddress: string;
  decimals: number;
}): ClaimAllocationMatch | null {
  const decoded = decodeMerkleClaim(params.input);
  if (!decoded) return null;

  const recipient = params.recipient.toLowerCase();
  const token = params.tokenAddress.toLowerCase();

  for (let i = 0; i < decoded.users.length; i += 1) {
    if (decoded.users[i] !== recipient) continue;
    if (decoded.tokens[i] !== token) continue;
    const allocationRaw = decoded.amounts[i];
    if (allocationRaw == null) continue;

    return {
      tokenAddress: params.tokenAddress,
      allocationRaw,
      allocationAmount: formatTokenAmount(
        formatUnits(allocationRaw, params.decimals),
      ),
    };
  }

  return null;
}
