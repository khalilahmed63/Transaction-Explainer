import { formatEther } from "viem";
import type {
  AssetMovement,
  TokenTransfer,
} from "@/types/transaction";
import { formatTokenAmount } from "@/lib/utils/format";

type AggregateKey = string;

function keyFor(symbol: string, tokenAddress?: string, isNative?: boolean): AggregateKey {
  if (isNative) return "native:ETH";
  return `token:${(tokenAddress ?? symbol).toLowerCase()}`;
}

export function computeWalletImpact(params: {
  wallet: string;
  tokenTransfers: TokenTransfer[];
  nativeValueWei?: bigint;
  to?: string | null;
}): { sent: AssetMovement[]; received: AssetMovement[] } {
  const wallet = params.wallet.toLowerCase();
  const sentMap = new Map<AggregateKey, AssetMovement & { raw: bigint }>();
  const receivedMap = new Map<AggregateKey, AssetMovement & { raw: bigint }>();

  function add(
    map: Map<AggregateKey, AssetMovement & { raw: bigint }>,
    movement: {
      symbol: string;
      name?: string;
      raw: bigint;
      decimals: number;
      tokenAddress?: string;
      isNative?: boolean;
      iconUrl?: string;
    },
  ) {
    const key = keyFor(movement.symbol, movement.tokenAddress, movement.isNative);
    const existing = map.get(key);
    if (existing) {
      existing.raw += movement.raw;
      existing.rawAmount = existing.raw.toString();
      existing.amount = movement.isNative
        ? formatTokenAmount(formatEther(existing.raw))
        : formatFromRaw(existing.raw, existing.decimals);
      if (!existing.iconUrl && movement.iconUrl) {
        existing.iconUrl = movement.iconUrl;
      }
    } else {
      map.set(key, {
        ...movement,
        amount: movement.isNative
          ? formatTokenAmount(formatEther(movement.raw))
          : formatFromRaw(movement.raw, movement.decimals),
        rawAmount: movement.raw.toString(),
      });
    }
  }

  for (const transfer of params.tokenTransfers) {
    const raw = BigInt(transfer.rawAmount);
    if (transfer.from.toLowerCase() === wallet) {
      add(sentMap, {
        symbol: transfer.symbol,
        name: transfer.name,
        raw,
        decimals: transfer.decimals,
        tokenAddress: transfer.tokenAddress,
        isNative: false,
        iconUrl: transfer.iconUrl,
      });
    }
    if (transfer.to.toLowerCase() === wallet) {
      add(receivedMap, {
        symbol: transfer.symbol,
        name: transfer.name,
        raw,
        decimals: transfer.decimals,
        tokenAddress: transfer.tokenAddress,
        isNative: false,
        iconUrl: transfer.iconUrl,
      });
    }
  }

  // Native ETH sent by initiator
  if (params.nativeValueWei && params.nativeValueWei > 0n) {
    add(sentMap, {
      symbol: "ETH",
      name: "Ether",
      raw: params.nativeValueWei,
      decimals: 18,
      isNative: true,
    });
  }

  // If native ETH was received by the wallet (rare for initiator, but handle)
  // Note: receipt doesn't give internal calls; we only know tx.value direction.

  function toMovement(
    item: AssetMovement & { raw: bigint },
  ): AssetMovement {
    return {
      symbol: item.symbol,
      name: item.name,
      amount: item.amount,
      rawAmount: item.rawAmount,
      decimals: item.decimals,
      tokenAddress: item.tokenAddress,
      isNative: item.isNative,
      iconUrl: item.iconUrl,
    };
  }

  return {
    sent: Array.from(sentMap.values()).map(toMovement),
    received: Array.from(receivedMap.values()).map(toMovement),
  };
}

function formatFromRaw(raw: bigint, decimals: number): string {
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;
  const str = abs.toString().padStart(decimals + 1, "0");
  const whole = str.slice(0, -decimals) || "0";
  const frac = str.slice(-decimals).replace(/0+$/, "");
  const value = frac ? `${whole}.${frac}` : whole;
  return formatTokenAmount(negative ? `-${value}` : value);
}
