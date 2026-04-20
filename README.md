# CREGI

CREGI is a hackathon-ready USDC checkout terminal. Customers pay with Solana Pay, the app hides Circle routing details, and the merchant receives an Avalanche settlement receipt.

## Stack

- Next.js App Router and TypeScript
- Vercel deployment model with Node.js route handlers
- Neon Postgres through Drizzle, with in-memory demo fallback
- Solana Pay-style QR URLs and Solana RPC payment verification
- Circle Gateway/CCTP readiness adapter
- Avalanche Fuji receipt contract through Viem

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The app works in demo mode without secrets. For a live-ish hackathon setup, configure the env vars below.

## Environment Variables

Required for persistence:

```text
DATABASE_URL=
```

Required for real Solana payment verification:

```text
SOLANA_RPC_URL=
SOLANA_SETTLEMENT_WALLET=
NEXT_PUBLIC_SOLANA_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

Required for Avalanche live receipt writes:

```text
NEXT_PUBLIC_SETTLEMENT_CONTRACT_ADDRESS=
AVALANCHE_PRIVATE_KEY=
AVALANCHE_LIVE_SETTLEMENT=true
```

Circle modes:

```text
CIRCLE_SETTLEMENT_MODE=demo
CIRCLE_SETTLEMENT_MODE=gateway-readiness
CIRCLE_SETTLEMENT_MODE=cctp-readiness
```

`demo` creates a deterministic settlement ID. `gateway-readiness` calls Circle Gateway `/info`. `cctp-readiness` calls Circle Iris `/v2/publicKeys`.

## Database

Use Neon from the Vercel Marketplace for the smoothest deploy. If you want to create the table manually, run the SQL in `db/schema.sql`.

With Drizzle:

```bash
npm run db:push
```

## Avalanche Contract

Deploy `contracts/CregiSettlement.sol` to Avalanche Fuji.

Network:

```text
Chain ID: 43113
RPC: https://api.avax-test.network/ext/bc/C/rpc
```

After deployment, set:

```text
NEXT_PUBLIC_SETTLEMENT_CONTRACT_ADDRESS=<deployed contract>
AVALANCHE_PRIVATE_KEY=<owner private key>
AVALANCHE_LIVE_SETTLEMENT=true
```

The app calls `recordSettlement(invoiceId, merchant, amount, solanaTx, circleTransferId)`.

## API Routes

```text
GET  /api/health
GET  /api/invoices
POST /api/invoices
GET  /api/invoices/:id
POST /api/invoices/:id/verify-solana
POST /api/invoices/:id/settle
GET  /api/invoices/:id/receipt
```

## Demo Flow

1. Create an invoice.
2. Show the Solana Pay QR.
3. Click `Demo paid` if you do not have devnet USDC ready, or `Verify payment` for a live Solana check.
4. Click `Settle merchant`.
5. Show the Circle transfer ID and Avalanche receipt hash in the proof panel.

## Vercel Deploy

1. Push the repo to GitHub.
2. Import into Vercel.
3. Add Neon Postgres through the Vercel Marketplace.
4. Add the env vars from `.env.example`.
5. Deploy.

Keep the public demo in `CIRCLE_SETTLEMENT_MODE=demo` until the team has verified Circle wallet/Gateway signing. The UI and APIs are designed so the live adapter can be swapped in without changing the merchant experience.
