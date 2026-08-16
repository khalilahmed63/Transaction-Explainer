import {
  mainnet,
  base,
  arbitrum,
  polygon,
  bsc,
  optimism,
  avalanche,
} from "viem/chains";
import type { Chain } from "viem";
import type {
  NativeCurrencySymbol,
  SupportedChain,
} from "@/types/transaction";

export type ChainConfig = {
  id: SupportedChain;
  name: string;
  nativeSymbol: NativeCurrencySymbol;
  nativeName: string;
  chainId: number;
  viemChain: Chain;
  rpcEnvKey: string;
  explorerName: string;
  explorerUrl: string;
  explorerTxPath: (hash: string) => string;
  explorerAddressPath: (address: string) => string;
  /** Trust Wallet assets pack slug */
  trustWalletSlug: string;
  /** GeckoTerminal network slug */
  geckoNetwork: string;
};

/** Display / selector order */
export const CHAIN_ORDER: SupportedChain[] = [
  "ethereum",
  "base",
  "arbitrum",
  "polygon",
  "bsc",
  "optimism",
  "avalanche",
];

export const CHAIN_CONFIG: Record<SupportedChain, ChainConfig> = {
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    nativeSymbol: "ETH",
    nativeName: "Ether",
    chainId: 1,
    viemChain: mainnet,
    rpcEnvKey: "ETHEREUM_RPC_URL",
    explorerName: "Etherscan",
    explorerUrl: "https://etherscan.io",
    explorerTxPath: (hash) => `https://etherscan.io/tx/${hash}`,
    explorerAddressPath: (address) =>
      `https://etherscan.io/address/${address}`,
    trustWalletSlug: "ethereum",
    geckoNetwork: "eth",
  },
  base: {
    id: "base",
    name: "Base",
    nativeSymbol: "ETH",
    nativeName: "Ether",
    chainId: 8453,
    viemChain: base,
    rpcEnvKey: "BASE_RPC_URL",
    explorerName: "BaseScan",
    explorerUrl: "https://basescan.org",
    explorerTxPath: (hash) => `https://basescan.org/tx/${hash}`,
    explorerAddressPath: (address) =>
      `https://basescan.org/address/${address}`,
    trustWalletSlug: "base",
    geckoNetwork: "base",
  },
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum",
    nativeSymbol: "ETH",
    nativeName: "Ether",
    chainId: 42161,
    viemChain: arbitrum,
    rpcEnvKey: "ARBITRUM_RPC_URL",
    explorerName: "Arbiscan",
    explorerUrl: "https://arbiscan.io",
    explorerTxPath: (hash) => `https://arbiscan.io/tx/${hash}`,
    explorerAddressPath: (address) =>
      `https://arbiscan.io/address/${address}`,
    trustWalletSlug: "arbitrum",
    geckoNetwork: "arbitrum",
  },
  polygon: {
    id: "polygon",
    name: "Polygon",
    nativeSymbol: "POL",
    nativeName: "POL",
    chainId: 137,
    viemChain: polygon,
    rpcEnvKey: "POLYGON_RPC_URL",
    explorerName: "PolygonScan",
    explorerUrl: "https://polygonscan.com",
    explorerTxPath: (hash) => `https://polygonscan.com/tx/${hash}`,
    explorerAddressPath: (address) =>
      `https://polygonscan.com/address/${address}`,
    trustWalletSlug: "polygon",
    geckoNetwork: "polygon",
  },
  bsc: {
    id: "bsc",
    name: "BNB Chain",
    nativeSymbol: "BNB",
    nativeName: "BNB",
    chainId: 56,
    viemChain: bsc,
    rpcEnvKey: "BSC_RPC_URL",
    explorerName: "BscScan",
    explorerUrl: "https://bscscan.com",
    explorerTxPath: (hash) => `https://bscscan.com/tx/${hash}`,
    explorerAddressPath: (address) =>
      `https://bscscan.com/address/${address}`,
    trustWalletSlug: "smartchain",
    geckoNetwork: "bsc",
  },
  optimism: {
    id: "optimism",
    name: "Optimism",
    nativeSymbol: "ETH",
    nativeName: "Ether",
    chainId: 10,
    viemChain: optimism,
    rpcEnvKey: "OPTIMISM_RPC_URL",
    explorerName: "OP Explorer",
    explorerUrl: "https://optimistic.etherscan.io",
    explorerTxPath: (hash) => `https://optimistic.etherscan.io/tx/${hash}`,
    explorerAddressPath: (address) =>
      `https://optimistic.etherscan.io/address/${address}`,
    trustWalletSlug: "optimism",
    geckoNetwork: "optimism",
  },
  avalanche: {
    id: "avalanche",
    name: "Avalanche",
    nativeSymbol: "AVAX",
    nativeName: "Avalanche",
    chainId: 43114,
    viemChain: avalanche,
    rpcEnvKey: "AVALANCHE_RPC_URL",
    explorerName: "SnowTrace",
    explorerUrl: "https://snowtrace.io",
    explorerTxPath: (hash) => `https://snowtrace.io/tx/${hash}`,
    explorerAddressPath: (address) =>
      `https://snowtrace.io/address/${address}`,
    trustWalletSlug: "avalanchec",
    geckoNetwork: "avax",
  },
};

const CHAIN_BY_ID = new Map<number, SupportedChain>(
  CHAIN_ORDER.map((id) => [CHAIN_CONFIG[id].chainId, id]),
);

export function getChainConfig(chain: SupportedChain): ChainConfig {
  return CHAIN_CONFIG[chain];
}

export function getSupportedChainById(
  chainId: number,
): SupportedChain | undefined {
  return CHAIN_BY_ID.get(chainId);
}
