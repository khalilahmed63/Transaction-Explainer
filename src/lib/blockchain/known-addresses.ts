import type { SupportedChain } from "@/types/transaction";

export type KnownAddress = {
  name: string;
  type: "protocol" | "token" | "exchange" | "bridge";
};

const ETHEREUM_KNOWN: Record<string, KnownAddress> = {
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    name: "USDC",
    type: "token",
  },
  "0xdac17f958d2ee523a2206206994597c13d831ec7": {
    name: "USDT",
    type: "token",
  },
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {
    name: "WETH",
    type: "token",
  },
  "0x6b175474e89094c44da98b954eedeac495271d0f": {
    name: "DAI",
    type: "token",
  },
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": {
    name: "Uniswap V2 Router",
    type: "protocol",
  },
  "0xe592427a0aece92de3edee1f18e0157c05861564": {
    name: "Uniswap V3 Router",
    type: "protocol",
  },
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": {
    name: "Uniswap Universal Router",
    type: "protocol",
  },
  "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad": {
    name: "Uniswap Universal Router",
    type: "protocol",
  },
  "0x1111111254eeb25477b68fb85ed929f73a960582": {
    name: "1inch Router",
    type: "protocol",
  },
  "0x111111125421ca6dc452d289314280a0f8842a65": {
    name: "1inch Router",
    type: "protocol",
  },
  "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9": {
    name: "Aave V2",
    type: "protocol",
  },
  "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": {
    name: "Aave V3 Pool",
    type: "protocol",
  },
  "0xdef1c0ded9bec7f1a1670819833240f027b25eff": {
    name: "0x Exchange Proxy",
    type: "protocol",
  },
};

const BASE_KNOWN: Record<string, KnownAddress> = {
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
    name: "USDC",
    type: "token",
  },
  "0x4200000000000000000000000000000000000006": {
    name: "WETH",
    type: "token",
  },
  "0x2621cc11d7cd44c9e50b2a67e35901f14acd3c47": {
    name: "Uniswap Universal Router",
    type: "protocol",
  },
  "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad": {
    name: "Uniswap Universal Router",
    type: "protocol",
  },
  "0x2626664c2603336e57b271c5c0be26d990b68970": {
    name: "Uniswap V3 Router",
    type: "protocol",
  },
  "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24": {
    name: "Uniswap V2 Router",
    type: "protocol",
  },
  "0xa238dd80c259a72e81d7e4664a9801593f98d1c5": {
    name: "Aave V3 Pool",
    type: "protocol",
  },
  "0x09be1692ca16e06f536f0038ff11d1da8524adb1": {
    name: "TEL",
    type: "token",
  },
  "0x3ef3d8ba38ebe18db133cec108f4d14ce00dd9ae": {
    name: "TEL Bonus Claim",
    type: "protocol",
  },
  "0x06b6a69a77ba5baeb264029544006ab8df9ead85": {
    name: "POL",
    type: "token",
  },
  "0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae": {
    name: "LI.FI Diamond",
    type: "protocol",
  },
};

const KNOWN_BY_CHAIN: Record<SupportedChain, Record<string, KnownAddress>> = {
  ethereum: ETHEREUM_KNOWN,
  base: BASE_KNOWN,
};

export function getAddressLabel(
  chain: SupportedChain,
  address: string,
): string | undefined {
  return KNOWN_BY_CHAIN[chain][address.toLowerCase()]?.name;
}

export function getKnownAddress(
  chain: SupportedChain,
  address: string,
): KnownAddress | undefined {
  return KNOWN_BY_CHAIN[chain][address.toLowerCase()];
}
