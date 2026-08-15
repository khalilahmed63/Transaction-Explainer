import type { SupportedChain } from "@/types/transaction";

export const APP_NAME = "Transaction Explainer";
export const APP_VERSION = "0.1";

export const APP_TAGLINE = "Blockchain transactions, explained simply.";

export const APP_DESCRIPTION =
  "Paste an Ethereum or Base transaction hash and understand what happened in plain English — including token transfers, swaps, approvals, wallet impact, and gas fees.";

export const APP_LONG_DESCRIPTION =
  "Transaction Explainer turns complex blockchain activity into clear, human-readable summaries. Instead of digging through calldata, logs, and contract addresses, paste a transaction hash and see what tokens moved, what was approved, what you sent or received, and how much network fee was paid.";

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

export const APP_FEATURES = [
  {
    id: "summary",
    title: "Plain-English summaries",
    description:
      "Get a clear explanation of what a transaction did — transfers, swaps, claims, approvals, or contract interactions — without reading raw blockchain data.",
  },
  {
    id: "transfers",
    title: "Token transfers & swaps",
    description:
      "See which tokens moved, how much was sent or received, and whether a transaction looks like a swap based on wallet token flow.",
  },
  {
    id: "approvals",
    title: "Token permissions",
    description:
      "Detect ERC-20 approvals and explain which contract received spending permission, including unlimited allowances when relevant.",
  },
  {
    id: "wallet-impact",
    title: "Wallet impact",
    description:
      "Understand what left and entered the initiating wallet in one place, so the net effect of the transaction is easy to follow.",
  },
  {
    id: "gas",
    title: "Network fees",
    description:
      "View the actual gas fee paid for the transaction in ETH, calculated from gas used and effective gas price.",
  },
  {
    id: "shareable",
    title: "Shareable result links",
    description:
      "Every explanation has a shareable URL for Ethereum or Base, so you can revisit or send a transaction breakdown to someone else.",
  },
] as const;

export const APP_FAQ = [
  {
    question: "What networks does Transaction Explainer support?",
    answer:
      "Version 0.1 supports Ethereum Mainnet and Base Mainnet. Paste a completed transaction hash from either network to get an explanation.",
  },
  {
    question: "Do I need to connect a wallet?",
    answer:
      "No. Transaction Explainer only analyzes completed on-chain transactions. There is no wallet connection, signing, or transaction simulation.",
  },
  {
    question: "Is this a blockchain explorer?",
    answer:
      "It is complementary to explorers like Etherscan and BaseScan. Explorers show technical details; Transaction Explainer focuses on a plain-English summary of what happened.",
  },
  {
    question: "Does it tell me if a transaction is safe?",
    answer:
      "No. It helps you understand activity such as transfers, approvals, and fees. It does not determine whether a token, contract, or protocol is safe.",
  },
] as const;

export const SUPPORTED_CHAINS: SupportedChain[] = ["ethereum", "base"];

export const EXAMPLE_TRANSACTIONS: Partial<
  Record<SupportedChain, { hash: string; label: string }>
> = {
  // Leave empty by default — configure real hashes in env or here when available.
};

export const DISCLAIMER =
  "Transaction Explainer helps make blockchain activity easier to understand. It does not determine whether a transaction, token, contract, or protocol is safe.";

export const GITHUB_URL =
  "https://github.com/khalilahmed63/Transaction-Explainer";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://transaction-explainer.vercel.app"
  );
}
