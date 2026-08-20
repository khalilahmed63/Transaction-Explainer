# Transaction Explainer

**Version 0.1**

Paste an Ethereum or Base transaction hash and get a clear, human-readable explanation of what happened — token transfers, swaps, approvals, wallet impact, and gas fees.

This is **not** a wallet, portfolio tracker, blockchain explorer, security scanner, or trading terminal.

> Transaction Explainer helps make blockchain activity easier to understand. It does **not** determine whether a transaction, token, contract, or protocol is safe.

## Supported Networks

- Ethereum Mainnet
- Base Mainnet
- Arbitrum One
- Polygon
- BNB Smart Chain
- OP Mainnet
- Avalanche C-Chain

## Features

- Plain-English transaction explanations
- Token transfer parsing
- Wallet impact (sent / received)
- ERC-20 approval detection
- Gas fee calculation
- Collapsible technical details
- Shareable result URLs (`/tx/ethereum/[hash]`, `/tx/base/[hash]`)
- Light and dark mode

## Analytics

The app uses [Vercel Web Analytics](https://vercel.com/docs/analytics) (page views + custom events) and [Speed Insights](https://vercel.com/docs/speed-insights). Enable both in the Vercel project dashboard. Custom events are wrapped in `src/lib/analytics/` and never include transaction hashes or wallet addresses.

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
| `ARBITRUM_RPC_URL` | Yes | JSON-RPC HTTPS endpoint for Arbitrum One |
| `POLYGON_RPC_URL` | Yes | JSON-RPC HTTPS endpoint for Polygon |
| `BSC_RPC_URL` | Yes | JSON-RPC HTTPS endpoint for BNB Smart Chain |
| `OPTIMISM_RPC_URL` | Yes | JSON-RPC HTTPS endpoint for OP Mainnet |
| `AVALANCHE_RPC_URL` | Yes | JSON-RPC HTTPS endpoint for Avalanche C-Chain |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site URL (defaults to `https://tx.tomnitive.com`) |
| `ENABLE_INTERNAL_QA` | No | Set to `true` to enable `/internal/qa` (404 otherwise). Prefer Preview only. |
| `NEXT_PUBLIC_EXAMPLE_ETHEREUM_TX` | No | Override Ethereum “Try an example” hash |
| `NEXT_PUBLIC_EXAMPLE_BASE_TX` | No | Override Base “Try an example” hash |

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

## License

Copyright (C) 2026 Khalil Ahmed

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

See the [LICENSE](LICENSE) file for the full license text.
