import { createHash } from "node:crypto";
import {
  CIRCLE_GATEWAY_TESTNET_API,
  CIRCLE_IRIS_TESTNET_API
} from "@/lib/constants";
import type { CircleSettlementResult, Invoice } from "@/lib/types";

export async function createCircleSettlementIntent(
  invoice: Invoice
): Promise<CircleSettlementResult> {
  const mode = getCircleSettlementMode();

  if (mode === "gateway-readiness") {
    const baseUrl = process.env.CIRCLE_GATEWAY_API_BASE ?? CIRCLE_GATEWAY_TESTNET_API;
    const response = await fetch(`${baseUrl}/info`, {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Circle Gateway readiness failed with ${response.status}.`);
    }

    return {
      id: makeSettlementId("gateway", invoice),
      provider: "gateway",
      detail: "Circle Gateway API is reachable; production transfer signing is env-gated."
    };
  }

  if (mode === "cctp-readiness") {
    const baseUrl = process.env.CIRCLE_IRIS_API_BASE ?? CIRCLE_IRIS_TESTNET_API;
    const response = await fetch(`${baseUrl}/v2/publicKeys`, {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Circle CCTP readiness failed with ${response.status}.`);
    }

    return {
      id: makeSettlementId("cctp", invoice),
      provider: "cctp",
      detail: "Circle CCTP Iris API is reachable; production burn/mint is env-gated."
    };
  }

  return {
    id: makeSettlementId("demo", invoice),
    provider: "demo",
    detail: "Demo settlement intent created. Enable Circle mode for live readiness checks."
  };
}

function getCircleSettlementMode() {
  const mode = process.env.CIRCLE_SETTLEMENT_MODE?.trim();
  return mode === "gateway-readiness" || mode === "cctp-readiness" ? mode : "demo";
}

function makeSettlementId(prefix: string, invoice: Invoice) {
  const digest = createHash("sha256")
    .update(`${prefix}:${invoice.id}:${invoice.solanaTx ?? "pending"}`)
    .digest("hex")
    .slice(0, 18);
  return `${prefix}_${digest}`;
}
