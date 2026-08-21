import type { SupportedChain, TransactionType } from "@/types/transaction";
import { CHAIN_ORDER } from "@/lib/blockchain/chains";

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
  "Paste a transaction hash from Ethereum, Base, Arbitrum, Polygon, BNB Chain, Optimism, or Avalanche and understand what happened in plain English — including token transfers, swaps, approvals, wallet impact, and gas fees.";

export const APP_ABOUT =
  "Transaction Explainer translates EVM transaction activity into simple, readable explanations. It helps users understand token transfers, swaps, approvals, gas fees, and wallet impact without navigating raw blockchain data.";

export const APP_KEYWORDS = [
  "transaction explainer",
  "crypto transaction explained",
  "ethereum transaction decoder",
  "base transaction explained",
  "arbitrum transaction explained",
  "polygon transaction explained",
  "bnb chain transaction explained",
  "optimism transaction explained",
  "avalanche transaction explained",
  "blockchain transaction summary",
  "ERC-20 transfer explained",
  "token swap explained",
  "crypto gas fee",
  "wallet impact",
  "plain English blockchain",
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
      "Version 0.1 supports Ethereum, Base, Arbitrum, Polygon, BNB Chain, Optimism, and Avalanche.",
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
      "Native transfers, token transfers, approvals, swaps, claims, contract interactions, gas fees, and wallet impact — based on what is visible on-chain.",
  },
  {
    question: "Do you collect transaction hashes or wallet addresses?",
    answer:
      "No. Explanations are generated on demand from public blockchain data. Analytics events never include transaction hashes or wallet addresses.",
  },
] as const;

export const SUPPORTED_CHAINS: SupportedChain[] = [...CHAIN_ORDER];

export type ExampleTransaction = {
  hash: string;
  label: string;
};

/**
 * Central example hashes for the homepage example gallery (and env overrides).
 * Override via env without code changes. Empty hash = that chain's example is skipped.
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
  arbitrum: {
    hash:
      process.env.NEXT_PUBLIC_EXAMPLE_ARBITRUM_TX ??
      "0xcd92e0125e52e50f6ffe918ee02eccfaee32b7d305812b40c99308e43996f58d",
    label: "Example Arbitrum USDC transfer",
  },
  polygon: {
    hash:
      process.env.NEXT_PUBLIC_EXAMPLE_POLYGON_TX ??
      "0xd7270a2399ec2ee1964a476c482d1ca8a89c71af97312f478f85e28385a68b4d",
    label: "Example Polygon USDC transfer",
  },
  bsc: {
    hash:
      process.env.NEXT_PUBLIC_EXAMPLE_BSC_TX ??
      "0x808436d48de86041f00af167595d58eb43ac8db30bbe277aa7cfea59836861ee",
    label: "Example BNB Chain transfer",
  },
  optimism: {
    hash:
      process.env.NEXT_PUBLIC_EXAMPLE_OPTIMISM_TX ??
      "0x873e19143725a3bd70363b27e05cfe88c49805eb97b08be921307c791e818d77",
    label: "Example Optimism USDC transfer",
  },
  avalanche: {
    hash:
      process.env.NEXT_PUBLIC_EXAMPLE_AVALANCHE_TX ??
      "0x1633462cd1afaffa079b46fb5b5a3edb1ee9e7f949e3b9d8a7efb8b36c350c83",
    label: "Example Avalanche USDC transfer",
  },
};

export function getExampleTransaction(
  chain: SupportedChain,
): ExampleTransaction | null {
  const example = EXAMPLE_TRANSACTIONS[chain];
  if (!example?.hash?.trim()) return null;
  return example;
}

export type ExampleGalleryItem = {
  chain: SupportedChain;
  hash: string;
  label: string;
  type: TransactionType;
};

/**
 * A small, diverse set of real transactions for the homepage "try an
 * example" gallery — lets a visitor with no hash of their own see a few
 * different explanation types at a glance. Distinct from
 * EXAMPLE_TRANSACTIONS (per-chain default hashes, overridable via env).
 *
 * The two entries below are guaranteed to work today — they reuse hashes
 * already verified in EXAMPLE_TRANSACTIONS. To show the full range of what
 * the app explains, add a real swap and a real claim/NFT transaction: grab
 * one from Etherscan/Basescan, paste it into your own app first to confirm
 * it explains the way you expect, then add it here.
 */
export const EXAMPLE_GALLERY: ExampleGalleryItem[] = [
  {
    chain: "ethereum",
    hash: EXAMPLE_TRANSACTIONS.ethereum!.hash,
    label: "Simple USDC transfer",
    type: "token_transfer",
  },
  {
    chain: "base",
    hash: EXAMPLE_TRANSACTIONS.base!.hash,
    label: "USDC transfer on Base",
    type: "token_transfer",
  },
  // Uncomment once you've grabbed + verified a real hash for each:
  // {
  //   chain: "ethereum",
  //   hash: "0x...",
  //   label: "Token swap",
  //   type: "token_swap",
  // },
  // {
  //   chain: "ethereum",
  //   hash: "0x...",
  //   label: "NFT claim",
  //   type: "token_claim",
  // },
];

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
