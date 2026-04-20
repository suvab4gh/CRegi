# CRegi

CRegi is a merchant checkout demo for accepting USDC with a Solana payment flow and Avalanche settlement tracking.

## What it does

- Creates invoices for merchant checkout
- Generates Solana Pay-compatible checkout references/QR payloads
- Verifies invoice payments through Solana transaction references
- Simulates/records settlement on Avalanche
- Provides a React dashboard for invoice and settlement status

## Tech stack

- React + Vite frontend
- Express + TypeScript backend (`server.ts`)
- Solana and Avalanche helper integrations in `src/lib`

## Prerequisites

- Node.js 20+
- npm

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create local environment config:
   ```bash
   cp .env.example .env.local
   ```
3. Update values in `.env.local` as needed (`GEMINI_API_KEY`, `CIRCLE_API_KEY`, `DATABASE_URL`, `SOLANA_RPC_URL`, `AVALANCHE_RPC_URL`).

## Run locally

```bash
npm run dev
```

Server starts on `http://localhost:3000`.

## Build and production run

```bash
npm run build
npm run start
```

## Type check

```bash
npm run lint
```

## API endpoints

- `GET /api/health`
- `GET /api/invoices`
- `POST /api/invoices`
- `POST /api/invoices/:id/verify`
- `POST /api/invoices/:id/settle`
