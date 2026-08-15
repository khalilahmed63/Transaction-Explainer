import {
  type Address,
  type Hex,
  type Log,
  type PublicClient,
  decodeEventLog,
  decodeFunctionData,
  getAddress,
  maxUint256,
  parseAbi,
  parseAbiItem,
} from "viem";
import type { SupportedChain, TokenApproval } from "@/types/transaction";
import { formatTokenAmount } from "@/lib/utils/format";
import { getAddressLabel } from "./known-addresses";
import { formatTokenRawAmount, getTokenMetadata } from "./token-metadata";

const approveAbi = parseAbi([
  "function approve(address spender, uint256 amount)",
]);

const approvalEvent = parseAbiItem(
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
);

function isUnlimited(amount: bigint): boolean {
  // Treat near-max as unlimited (common pattern)
  return amount >= maxUint256 / BigInt(2);
}

export async function parseApprovalsFromInput(
  client: PublicClient,
  chain: SupportedChain,
  to: Address | null | undefined,
  input: Hex | undefined,
): Promise<TokenApproval[]> {
  if (!to || !input || input === "0x" || input.length < 10) return [];

  try {
    const decoded = decodeFunctionData({
      abi: approveAbi,
      data: input,
    });

    if (decoded.functionName !== "approve") return [];

    const spender = getAddress(decoded.args[0] as Address);
    const amount = decoded.args[1] as bigint;
    const tokenAddress = getAddress(to);
    const metadata = await getTokenMetadata(client, tokenAddress);
    const amountFormatted = formatTokenRawAmount(amount, metadata.decimals);

    return [
      {
        tokenAddress,
        symbol: metadata.symbol,
        name: metadata.name,
        spender,
        spenderLabel: getAddressLabel(chain, spender),
        amount: isUnlimited(amount)
          ? "Unlimited"
          : formatTokenAmount(amountFormatted),
        rawAmount: amount.toString(),
        decimals: metadata.decimals,
        isUnlimited: isUnlimited(amount),
        iconUrl: metadata.iconUrl,
      },
    ];
  } catch {
    return [];
  }
}

export async function parseApprovalsFromLogs(
  client: PublicClient,
  chain: SupportedChain,
  logs: Log[],
  owner: Address,
): Promise<TokenApproval[]> {
  const approvals: TokenApproval[] = [];

  for (const log of logs) {
    if (!log.topics[0] || log.topics.length < 3) continue;

    try {
      const decoded = decodeEventLog({
        abi: [approvalEvent],
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName !== "Approval") continue;

      const eventOwner = getAddress(decoded.args.owner as Address);
      if (eventOwner.toLowerCase() !== owner.toLowerCase()) continue;

      const spender = getAddress(decoded.args.spender as Address);
      const value = decoded.args.value as bigint;
      const tokenAddress = getAddress(log.address);
      const metadata = await getTokenMetadata(client, tokenAddress);
      const amountFormatted = formatTokenRawAmount(value, metadata.decimals);

      approvals.push({
        tokenAddress,
        symbol: metadata.symbol,
        name: metadata.name,
        spender,
        spenderLabel: getAddressLabel(chain, spender),
        amount: isUnlimited(value)
          ? "Unlimited"
          : formatTokenAmount(amountFormatted),
        rawAmount: value.toString(),
        decimals: metadata.decimals,
        isUnlimited: isUnlimited(value),
        iconUrl: metadata.iconUrl,
      });
    } catch {
      continue;
    }
  }

  return approvals;
}

export async function parseApprovals(
  client: PublicClient,
  chain: SupportedChain,
  to: Address | null | undefined,
  input: Hex | undefined,
  logs: Log[],
  owner: Address,
): Promise<TokenApproval[]> {
  const fromInput = await parseApprovalsFromInput(client, chain, to, input);
  if (fromInput.length > 0) return fromInput;
  return parseApprovalsFromLogs(client, chain, logs, owner);
}

export function getMethodId(input: Hex | undefined): string | undefined {
  if (!input || input === "0x" || input.length < 10) return undefined;
  return input.slice(0, 10);
}
