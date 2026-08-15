import { mainnet, base } from "viem/chains";
import type { Chain } from "viem";
import type { SupportedChain } from "@/types/transaction";

export type ChainConfig = {
  id: SupportedChain;
  name: string;
  nativeSymbol: "ETH";
  viemChain: Chain;
  explorerName: string;
  explorerUrl: string;
  explorerTxPath: (hash: string) => string;
  explorerAddressPath: (address: string) => string;
};

export const CHAIN_CONFIG: Record<SupportedChain, ChainConfig> = {
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    nativeSymbol: "ETH",
    viemChain: mainnet,
    explorerName: "Etherscan",
    explorerUrl: "https://etherscan.io",
    explorerTxPath: (hash) => `https://etherscan.io/tx/${hash}`,
    explorerAddressPath: (address) => `https://etherscan.io/address/${address}`,
  },
  base: {
    id: "base",
    name: "Base",
    nativeSymbol: "ETH",
    viemChain: base,
    explorerName: "BaseScan",
    explorerUrl: "https://basescan.org",
    explorerTxPath: (hash) => `https://basescan.org/tx/${hash}`,
    explorerAddressPath: (address) => `https://basescan.org/address/${address}`,
  },
};

export function getChainConfig(chain: SupportedChain): ChainConfig {
  return CHAIN_CONFIG[chain];
}
