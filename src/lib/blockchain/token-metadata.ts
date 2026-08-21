import {
  type Address,
  type PublicClient,
  erc20Abi,
  formatUnits,
  hexToString,
  parseAbi,
} from "viem";
import type { SupportedChain } from "@/types/transaction";
import { resolveTokenIconUrl } from "@/lib/tokens/icons";
import { getChainConfig, getSupportedChainById } from "@/lib/blockchain/chains";

export type TokenMetadata = {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  iconUrl?: string;
};

const metadataCache = new Map<string, TokenMetadata>();

/** Well-known tokens that may fail intermittent RPC metadata reads */
const KNOWN_TOKEN_META: Record<
  string,
  Pick<TokenMetadata, "symbol" | "name" | "decimals">
> = {
  // Base
  "8453:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
  "8453:0x4200000000000000000000000000000000000006": {
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
  },
  "8453:0x09be1692ca16e06f536f0038ff11d1da8524adb1": {
    symbol: "TEL",
    name: "Telcoin",
    decimals: 2,
  },
  // POL (Polygon) on Base — bridged / wrapped POL
  "8453:0x06b6a69a77ba5baeb264029544006ab8df9ead85": {
    symbol: "POL",
    name: "Polygon",
    decimals: 18,
  },
  // Ethereum
  "1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
  },
  "1:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
  },
  "1:0x455e53cbb86018ac2b8092fdcd39d8444affc3f6": {
    symbol: "POL",
    name: "Polygon Ecosystem Token",
    decimals: 18,
  },
  "1:0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0": {
    symbol: "MATIC",
    name: "Matic Token",
    decimals: 18,
  },
};

const bytes32MetaAbi = parseAbi([
  "function symbol() view returns (bytes32)",
  "function name() view returns (bytes32)",
]);

function cacheKey(chainId: number, address: string): string {
  return `${chainId}:${address.toLowerCase()}`;
}

function chainFromClient(client: PublicClient): SupportedChain {
  const id = client.chain?.id;
  if (id == null) return "ethereum";
  return getSupportedChainById(id) ?? "ethereum";
}

function decodeBytes32(value: `0x${string}`): string {
  try {
    return hexToString(value, { size: 32 }).replace(/\0/g, "").trim();
  } catch {
    return "";
  }
}

async function readSymbol(
  client: PublicClient,
  tokenAddress: Address,
): Promise<string | null> {
  try {
    const symbol = await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "symbol",
    });
    const text = String(symbol ?? "").trim();
    if (text) return text;
  } catch {
    // try bytes32
  }

  try {
    const symbol = await client.readContract({
      address: tokenAddress,
      abi: bytes32MetaAbi,
      functionName: "symbol",
    });
    const text = decodeBytes32(symbol);
    if (text) return text;
  } catch {
    // ignore
  }

  return null;
}

async function readName(
  client: PublicClient,
  tokenAddress: Address,
): Promise<string | null> {
  try {
    const name = await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "name",
    });
    const text = String(name ?? "").trim();
    if (text) return text;
  } catch {
    // try bytes32
  }

  try {
    const name = await client.readContract({
      address: tokenAddress,
      abi: bytes32MetaAbi,
      functionName: "name",
    });
    const text = decodeBytes32(name);
    if (text) return text;
  } catch {
    // ignore
  }

  return null;
}

async function readDecimals(
  client: PublicClient,
  tokenAddress: Address,
): Promise<number | null> {
  try {
    const decimals = await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    });
    const value = Number(decimals);
    if (Number.isFinite(value) && value >= 0 && value <= 36) return value;
  } catch {
    // ignore
  }
  return null;
}

async function fetchGeckoMeta(
  chain: SupportedChain,
  tokenAddress: Address,
): Promise<Pick<TokenMetadata, "symbol" | "name" | "decimals"> | null> {
  const network = getChainConfig(chain).geckoNetwork;
  try {
    const res = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${tokenAddress.toLowerCase()}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: {
        attributes?: {
          symbol?: string;
          name?: string;
          decimals?: number | string;
        };
      };
    };
    const attrs = json.data?.attributes;
    if (!attrs?.symbol) return null;
    return {
      symbol: attrs.symbol,
      name: attrs.name || attrs.symbol,
      decimals: Number(attrs.decimals ?? 18),
    };
  } catch {
    return null;
  }
}

export async function getTokenMetadata(
  client: PublicClient,
  tokenAddress: Address,
): Promise<TokenMetadata> {
  const chainId = client.chain?.id ?? 0;
  const key = cacheKey(chainId, tokenAddress);
  const cached = metadataCache.get(key);
  if (cached && cached.symbol !== "UNKNOWN") return cached;

  const chain = chainFromClient(client);
  const known =
    KNOWN_TOKEN_META[`${chainId}:${tokenAddress.toLowerCase()}`] ?? null;

  // Prefer curated metadata first — public RPCs often stall on eth_call, and
  // waiting on timeouts (20s × retries) makes example pages look "stuck loading".
  let symbol: string | null = known?.symbol ?? null;
  let name: string | null = known?.name ?? null;
  let decimals: number | null = known?.decimals ?? null;

  if (!symbol || !name || decimals == null) {
    const [symbolResult, nameResult, decimalsResult] = await Promise.all([
      symbol ? Promise.resolve(null) : readSymbol(client, tokenAddress),
      name ? Promise.resolve(null) : readName(client, tokenAddress),
      decimals != null
        ? Promise.resolve(null)
        : readDecimals(client, tokenAddress),
    ]);

    symbol = symbol ?? symbolResult;
    name = name ?? nameResult;
    decimals = decimals ?? decimalsResult;
  }

  if (!symbol || decimals == null) {
    const gecko = await fetchGeckoMeta(chain, tokenAddress);
    if (gecko) {
      symbol = symbol ?? gecko.symbol;
      name = name ?? gecko.name;
      decimals = decimals ?? gecko.decimals;
    }
  }

  // Still unresolved — return uncached soft fallback so a later request can retry
  if (!symbol || decimals == null) {
    return {
      address: tokenAddress,
      symbol: symbol ?? "UNKNOWN",
      name: name ?? "Unknown Token",
      decimals: decimals ?? 18,
    };
  }

  const symbolText = symbol;
  const iconUrl =
    (await resolveTokenIconUrl(chain, tokenAddress, symbolText)) ?? undefined;

  const metadata: TokenMetadata = {
    address: tokenAddress,
    symbol: symbolText,
    name: name ?? symbolText,
    decimals,
    iconUrl,
  };

  metadataCache.set(key, metadata);
  return metadata;
}

export function formatTokenRawAmount(
  rawAmount: bigint,
  decimals: number,
): string {
  return formatUnits(rawAmount, decimals);
}

/** Clear in-memory cache — useful for tests */
export function clearTokenMetadataCache(): void {
  metadataCache.clear();
}
