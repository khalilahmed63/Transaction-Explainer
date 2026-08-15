import {
  type Address,
  type Hex,
  type Log,
  type PublicClient,
  decodeEventLog,
  parseAbiItem,
  getAddress,
} from "viem";
import type { SupportedChain, TokenTransfer } from "@/types/transaction";
import { formatTokenAmount } from "@/lib/utils/format";
import { getAddressLabel } from "./known-addresses";
import { formatTokenRawAmount, getTokenMetadata } from "./token-metadata";

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);

export async function parseTokenTransfers(
  client: PublicClient,
  chain: SupportedChain,
  logs: Log[],
): Promise<TokenTransfer[]> {
  const transfers: TokenTransfer[] = [];
  const metadataPromises = new Map<string, ReturnType<typeof getTokenMetadata>>();

  for (const log of logs) {
    if (!log.topics[0] || log.topics.length < 3) continue;

    try {
      const decoded = decodeEventLog({
        abi: [transferEvent],
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName !== "Transfer") continue;

      const tokenAddress = getAddress(log.address);
      const from = getAddress(decoded.args.from as Address);
      const to = getAddress(decoded.args.to as Address);
      const value = decoded.args.value as bigint;

      if (!metadataPromises.has(tokenAddress.toLowerCase())) {
        metadataPromises.set(
          tokenAddress.toLowerCase(),
          getTokenMetadata(client, tokenAddress),
        );
      }

      const metadata = await metadataPromises.get(tokenAddress.toLowerCase())!;
      const rawAmount = value.toString();
      const amountFormatted = formatTokenRawAmount(value, metadata.decimals);

      transfers.push({
        tokenAddress,
        symbol: metadata.symbol,
        name: metadata.name,
        amount: formatTokenAmount(amountFormatted),
        rawAmount,
        decimals: metadata.decimals,
        from,
        to,
        fromLabel: getAddressLabel(chain, from),
        toLabel: getAddressLabel(chain, to),
        logIndex: Number(log.logIndex ?? transfers.length),
        iconUrl: metadata.iconUrl,
      });
    } catch {
      // Non-standard or incompatible Transfer log — skip safely
      continue;
    }
  }

  return transfers;
}

export function isTransferTopic(topic: Hex | undefined): boolean {
  if (!topic) return false;
  // keccak256("Transfer(address,address,uint256)")
  return (
    topic.toLowerCase() ===
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
  );
}
