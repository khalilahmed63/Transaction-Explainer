import { getAddress } from "viem";
import type { SupportedChain } from "@/types/transaction";

const TRUST_WALLET_CHAIN: Record<SupportedChain, string> = {
  ethereum: "ethereum",
  base: "base",
};

const GECKO_NETWORK: Record<SupportedChain, string> = {
  ethereum: "eth",
  base: "base",
};

/**
 * Well-known token logos (CoinGecko CDN).
 * Covers popular tokens and bridged assets that Trust Wallet may miss.
 */
const KNOWN_ICONS_BY_ADDRESS: Record<string, string> = {
  // Ethereum
  "ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48":
    "https://coin-images.coingecko.com/coins/images/6319/small/usdc.png",
  "ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7":
    "https://coin-images.coingecko.com/coins/images/325/small/Tether.png",
  "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2":
    "https://coin-images.coingecko.com/coins/images/2518/small/weth.png",
  "ethereum:0x6b175474e89094c44da98b954eedeac495271d0f":
    "https://coin-images.coingecko.com/coins/images/9956/small/Badge_Dai.png",
  "ethereum:0x467bccd9d29f223bce8043b84e8c8b282827790f":
    "https://coin-images.coingecko.com/coins/images/1899/small/tel.png",

  // Base
  "base:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913":
    "https://coin-images.coingecko.com/coins/images/6319/small/usdc.png",
  "base:0x4200000000000000000000000000000000000006":
    "https://coin-images.coingecko.com/coins/images/2518/small/weth.png",
  "base:0x09be1692ca16e06f536f0038ff11d1da8524adb1":
    "https://coin-images.coingecko.com/coins/images/1899/small/tel.png",
  "base:0x06b6a69a77ba5baeb264029544006ab8df9ead85":
    "https://coin-images.coingecko.com/coins/images/32440/small/polygon.png",
  "ethereum:0x455e53cbb86018ac2b8092fdcd39d8444affc3f6":
    "https://coin-images.coingecko.com/coins/images/32440/small/polygon.png",
  "ethereum:0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0":
    "https://coin-images.coingecko.com/coins/images/4713/small/polygon.png",
};

const KNOWN_ICONS_BY_SYMBOL: Record<string, string> = {
  USDC: "https://coin-images.coingecko.com/coins/images/6319/small/usdc.png",
  USDT: "https://coin-images.coingecko.com/coins/images/325/small/Tether.png",
  DAI: "https://coin-images.coingecko.com/coins/images/9956/small/Badge_Dai.png",
  WETH: "https://coin-images.coingecko.com/coins/images/2518/small/weth.png",
  ETH: "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png",
  TEL: "https://coin-images.coingecko.com/coins/images/1899/small/tel.png",
  WBTC: "https://coin-images.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
  CBETH: "https://coin-images.coingecko.com/coins/images/27008/small/cbeth.png",
  POL: "https://coin-images.coingecko.com/coins/images/32440/small/polygon.png",
  MATIC: "https://coin-images.coingecko.com/coins/images/4713/small/polygon.png",
};

function checksum(address: string): string | null {
  try {
    return getAddress(address);
  } catch {
    return null;
  }
}

export function getTrustWalletIconUrl(
  chain: SupportedChain,
  tokenAddress: string,
): string | null {
  const checksummed = checksum(tokenAddress);
  if (!checksummed) return null;
  const twChain = TRUST_WALLET_CHAIN[chain];
  return `https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${twChain}/assets/${checksummed}/logo.png`;
}

export function getKnownIconUrl(
  chain: SupportedChain,
  tokenAddress?: string,
  symbol?: string,
): string | null {
  if (tokenAddress) {
    const byAddress =
      KNOWN_ICONS_BY_ADDRESS[`${chain}:${tokenAddress.toLowerCase()}`];
    if (byAddress) return byAddress;
  }
  if (symbol) {
    const bySymbol = KNOWN_ICONS_BY_SYMBOL[symbol.toUpperCase()];
    if (bySymbol) return bySymbol;
  }
  return null;
}

/** Ordered candidate URLs for client-side fallbacks */
export function getTokenIconCandidates(
  chain: SupportedChain,
  tokenAddress?: string,
  symbol?: string,
  preferred?: string | null,
): string[] {
  const urls: string[] = [];
  const add = (url: string | null | undefined) => {
    if (url && !urls.includes(url)) urls.push(url);
  };

  add(preferred);
  add(getKnownIconUrl(chain, tokenAddress, symbol));
  if (tokenAddress) {
    add(getTrustWalletIconUrl(chain, tokenAddress));
    // Many Base bridged tokens still live under the Ethereum Trust Wallet pack
    if (chain === "base") {
      add(getTrustWalletIconUrl("ethereum", tokenAddress));
    }
  }

  return urls;
}

const geckoIconCache = new Map<string, string | null>();

export async function resolveTokenIconUrl(
  chain: SupportedChain,
  tokenAddress: string,
  symbol?: string,
): Promise<string | null> {
  const key = `${chain}:${tokenAddress.toLowerCase()}`;
  if (geckoIconCache.has(key)) return geckoIconCache.get(key) ?? null;

  const known = getKnownIconUrl(chain, tokenAddress, symbol);
  if (known) {
    geckoIconCache.set(key, known);
    return known;
  }

  try {
    const network = GECKO_NETWORK[chain];
    const res = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${tokenAddress.toLowerCase()}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (res.ok) {
      const json = (await res.json()) as {
        data?: { attributes?: { image_url?: string | null } };
      };
      const image = json.data?.attributes?.image_url ?? null;
      if (image && !image.includes("missing")) {
        geckoIconCache.set(key, image);
        return image;
      }
    }
  } catch {
    // Icon resolution must never break explanations
  }

  const trust = getTrustWalletIconUrl(chain, tokenAddress);
  geckoIconCache.set(key, trust);
  return trust;
}

export function getTokenFallbackColor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 42% 42%)`;
}
