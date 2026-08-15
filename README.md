# Transaction Explainer

**Version 0.1**

Paste an Ethereum or Base transaction hash and get a clear, human-readable explanation of what happened — token transfers, swaps, approvals, wallet impact, and gas fees.

This is **not** a wallet, portfolio tracker, blockchain explorer, security scanner, or trading terminal.

> Transaction Explainer helps make blockchain activity easier to understand. It does **not** determine whether a transaction, token, contract, or protocol is safe.

## Supported Networks

- Ethereum Mainnet
- Base Mainnet

## Features

- Plain-English transaction explanations
- Token transfer parsing
- Wallet impact (sent / received)
- ERC-20 approval detection
- Gas fee calculation
- Collapsible technical details
- Shareable result URLs (`/tx/ethereum/[hash]`, `/tx/base/[hash]`)
- Light and dark mode

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in ETHEREUM_RPC_URL and BASE_RPC_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `ETHEREUM_RPC_URL` | Yes | JSON-RPC HTTPS endpoint for Ethereum Mainnet |
| `BASE_RPC_URL` | Yes | JSON-RPC HTTPS endpoint for Base Mainnet |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site URL for SEO metadata, sitemap, and Open Graph (set this in production) |

RPC URLs are used **only on the server**. Do not commit real credentials.

Prefer a reliable Base RPC such as `https://mainnet.base.org` for local development.
Some public endpoints reject receipt requests, which prevents token transfer parsing.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
npm test         # Unit tests (classification & formatting)
```

## Architecture

Blockchain logic lives under `src/lib/blockchain/` and stays separate from UI:

1. Fetch transaction + receipt + block via **viem**
2. Parse ERC-20 transfers and approvals
3. Compute wallet impact for `tx.from`
4. Classify (transfer / swap / approval / claim / contract interaction)
5. Build a conservative human-readable summary

The UI consumes a normalized `TransactionExplanation` model.

## Deploy on Vercel

1. Push the repo to GitHub
2. Import the project in Vercel
3. Set `ETHEREUM_RPC_URL` and `BASE_RPC_URL` in project environment variables
4. Deploy

## Version

**Version 0.1** — focused on the single experience: paste a hash → understand what happened.
