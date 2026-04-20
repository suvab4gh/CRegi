export type InvoiceStatus =
  | "awaiting_payment"
  | "paid_on_solana"
  | "settling"
  | "settled_on_avalanche"
  | "failed";

export type Invoice = {
  id: string;
  merchantName: string;
  itemName: string;
  amountUsdc: string;
  solanaReference: string;
  solanaRecipient: string;
  solanaPaymentUrl: string;
  solanaTx: string | null;
  avalancheMerchantAddress: string;
  avalancheTx: string | null;
  circleTransferId: string | null;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
};

export type RuntimeMode = "ready" | "demo";

export type RuntimeReadiness = {
  database: RuntimeMode;
  solana: RuntimeMode;
  circle: RuntimeMode;
  avalanche: RuntimeMode;
  notes: string[];
};

export type CreateInvoiceInput = {
  merchantName: string;
  itemName: string;
  amountUsdc: string;
  avalancheMerchantAddress: string;
};

export type CircleSettlementResult = {
  id: string;
  provider: "gateway" | "cctp" | "demo";
  detail: string;
};

export type AvalancheSettlementResult = {
  txHash: string;
  mode: "live" | "demo";
};
