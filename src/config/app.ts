import type { SupportedChain } from "@/types/transaction";

export const APP_CONFIG = {
  name: "Transaction Explainer",
  url: "https://tx.tomnitive.com",
  creator: {
    name: "Tomnitive",
    url: "https://tomnitive.com",
  },
} as const;

export const APP_NAME = APP_CONFIG.name;
export const APP_VERSION = "0.1";

export const APP_TAGLINE = "Blockchain transactions, explained simply.";

export const APP_DESCRIPTION =
  "Paste an Ethereum or Base transaction hash and understand what happened in plain English — including token transfers, swaps, approvals, wallet impact, and gas fees.";

export const APP_ABOUT =
  "Transaction Explainer translates Ethereum and Base transaction activity into simple, readable explanations. It helps users understand token transfers, swaps, approvals, gas fees, and wallet impact without navigating raw blockchain data.";

export const APP_KEYWORDS = [
  "transaction explainer",
  "crypto transaction explained",
  "ethereum transaction decoder",
  "base transaction explained",
  "blockchain transaction summary",
  "ERC-20 transfer explained",
  "token swap explained",
  "crypto gas fee",
  "wallet impact",
  "plain English blockchain",
  "etherscan alternative simple",
  "understand crypto transaction",
] as const;

/** Compact homepage capability list — one job, no repeated product pitch. */
export const APP_CAPABILITIES = [
  {
    id: "transfers",
    title: "Token transfers",
    description: "See which tokens moved, how much, and where they went.",
  },
  {
    id: "swaps",
    title: "Swaps",
    description: "Understand what you sent and what you received in a trade.",
  },
  {
    id: "approvals",
    title: "Approvals",
    description: "Spot spending permissions granted to a contract.",
  },
  {
    id: "gas",
    title: "Gas fees",
    description: "View the network fee paid for the transaction.",
  },
  {
    id: "wallet-impact",
    title: "Wallet impact",
    description: "See what left and entered the initiating wallet.",
  },
] as const;

export const APP_FAQ = [
  {
    question: "What is a transaction hash?",
    answer:
      "A transaction hash is a unique ID for a completed blockchain transaction. It usually starts with 0x and is 66 characters long. You can copy it from a wallet or a block explorer.",
  },
  {
    question: "Which networks are supported?",
    answer:
      "Version 0.1 supports Ethereum Mainnet and Base Mainnet.",
  },
  {
    question: "Do I need to connect my wallet?",
    answer:
      "No. Transaction Explainer only analyzes completed on-chain transactions. There is no wallet connection or signing.",
  },
  {
    question: "Does Transaction Explainer determine whether a transaction is safe?",
    answer:
      "No. It helps you understand activity such as transfers, approvals, and fees. It does not score risk or detect scams.",
  },
  {
    question: "What transactions can it explain?",
    answer:
      "Basic ETH transfers, token transfers, approvals, swaps, claims, contract interactions, gas fees, and wallet impact — based on what is visible on-chain.",
  },
] as const;

export const SUPPORTED_CHAINS: SupportedChain[] = ["ethereum", "base"];

export type ExampleTransaction = {
  hash: string;
  label: string;
};

/**
 * Central example hashes for the homepage "Try an example" action.
 * Override via env without code changes. Empty hash = CTA hidden for that chain.
 */
export const EXAMPLE_TRANSACTIONS: Partial<
  Record<SupportedChain, ExampleTransaction>
> = {
  ethereum: {
    hash:
      process.env.NEXT_PUBLIC_EXAMPLE_ETHEREUM_TX ??
      "0xd5a4dab2691e1e6374173a17597184245d2d0296804475ad1bbc0cc21b53abc8",
    label: "Example Ethereum USDC transfer",
  },
  base: {
    hash:
      process.env.NEXT_PUBLIC_EXAMPLE_BASE_TX ??
      "0xe9ead06b3b46b237f72a31dd6ab5c17b60d636b977105930e102b9aa09e72972",
    label: "Example Base USDC transfer",
  },
};

export function getExampleTransaction(
  chain: SupportedChain,
): ExampleTransaction | null {
  const example = EXAMPLE_TRANSACTIONS[chain];
  if (!example?.hash?.trim()) return null;
  return example;
}

export const DISCLAIMER =
  "Transaction Explainer helps make blockchain activity easier to understand. It does not determine whether a transaction, token, contract, or protocol is safe.";

export const GITHUB_URL =
  "https://github.com/khalilahmed63/Transaction-Explainer";

/** Canonical production URL — prefer env override, else APP_CONFIG.url. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return APP_CONFIG.url;
}
