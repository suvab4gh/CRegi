import {
  SOLANA_DEVNET_USDC_MINT,
  SOLANA_MAINNET_USDC_MINT
} from "@/lib/constants";
import type { RuntimeReadiness } from "@/lib/types";

export async function getRuntimeReadiness(): Promise<RuntimeReadiness> {
  const solanaRpcUrl = getEnvValue("SOLANA_RPC_URL");
  const solanaSettlementWallet = getEnvValue("SOLANA_SETTLEMENT_WALLET");
  const circleMode = getCircleSettlementMode();
  const database = getEnvValue("DATABASE_URL") ? "ready" : "demo";
  const solana = solanaRpcUrl && solanaSettlementWallet ? "ready" : "demo";
  const circle = circleMode === "demo" ? "demo" : "ready";
  const avalanche =
    getEnvValue("AVALANCHE_PRIVATE_KEY") &&
    getEnvValue("NEXT_PUBLIC_SETTLEMENT_CONTRACT_ADDRESS")
      ? "ready"
      : "demo";

  const notes: string[] = [];

  if (database === "demo") {
    notes.push("Using in-memory invoices until DATABASE_URL is configured.");
  }

  if (!solanaRpcUrl) {
    notes.push("Using public Solana Devnet RPC unless SOLANA_RPC_URL is set.");
  }

  if (!solanaSettlementWallet) {
    notes.push("Set SOLANA_SETTLEMENT_WALLET before accepting live Solana payments.");
  }

  const mint = getEnvValue("NEXT_PUBLIC_SOLANA_USDC_MINT");
  if (solanaRpcUrl?.includes("mainnet") && mint === SOLANA_DEVNET_USDC_MINT) {
    notes.push("Solana RPC is mainnet but USDC mint is devnet; switch one before live verification.");
  }

  if (solanaRpcUrl?.includes("devnet") && mint === SOLANA_MAINNET_USDC_MINT) {
    notes.push("Solana RPC is devnet but USDC mint is mainnet; switch one before live verification.");
  }

  if (circle === "demo") {
    notes.push("Circle settlement is in demo mode until CIRCLE_SETTLEMENT_MODE is enabled.");
  }

  if (avalanche === "demo") {
    notes.push("Avalanche receipts are simulated until contract env vars are configured.");
  }

  return {
    database,
    solana,
    circle,
    avalanche,
    notes
  };
}

function getCircleSettlementMode() {
  const mode = getEnvValue("CIRCLE_SETTLEMENT_MODE");
  return mode === "gateway-readiness" || mode === "cctp-readiness" ? mode : "demo";
}

function getEnvValue(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}
