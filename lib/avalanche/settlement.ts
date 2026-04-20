import { createHash } from "node:crypto";
import { createWalletClient, http, isAddress, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import { DEFAULT_AVALANCHE_RPC_URL } from "@/lib/constants";
import { decimalToUsdcMicros } from "@/lib/money";
import type {
  AvalancheSettlementResult,
  CircleSettlementResult,
  Invoice
} from "@/lib/types";

export const settlementAbi = [
  {
    type: "function",
    name: "recordSettlement",
    stateMutability: "nonpayable",
    inputs: [
      { name: "invoiceId", type: "string" },
      { name: "merchant", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "solanaTx", type: "string" },
      { name: "circleTransferId", type: "string" }
    ],
    outputs: []
  }
] as const;

export async function recordAvalancheSettlement(
  invoice: Invoice,
  circle: CircleSettlementResult
): Promise<AvalancheSettlementResult> {
  const privateKey = process.env.AVALANCHE_PRIVATE_KEY;
  const contractAddress = process.env.NEXT_PUBLIC_SETTLEMENT_CONTRACT_ADDRESS;
  const liveSettlement = process.env.AVALANCHE_LIVE_SETTLEMENT === "true";

  if (!privateKey || !contractAddress || !liveSettlement) {
    return {
      txHash: makeDemoTx(invoice, circle),
      mode: "demo"
    };
  }

  if (!isAddress(contractAddress) || !isAddress(invoice.avalancheMerchantAddress)) {
    throw new Error("Avalanche contract or merchant address is invalid.");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: avalancheFuji,
    transport: http(process.env.AVALANCHE_RPC_URL ?? DEFAULT_AVALANCHE_RPC_URL)
  });

  const txHash = await client.writeContract({
    address: contractAddress,
    abi: settlementAbi,
    functionName: "recordSettlement",
    args: [
      invoice.id,
      invoice.avalancheMerchantAddress as Address,
      decimalToUsdcMicros(invoice.amountUsdc),
      invoice.solanaTx ?? "",
      circle.id
    ]
  });

  return {
    txHash,
    mode: "live"
  };
}

function makeDemoTx(invoice: Invoice, circle: CircleSettlementResult) {
  return `0x${createHash("sha256")
    .update(`${invoice.id}:${circle.id}:avalanche`)
    .digest("hex")}`;
}
