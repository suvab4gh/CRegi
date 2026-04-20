import {
  Connection,
  Keypair,
  PublicKey,
  type ParsedTransactionWithMeta
} from "@solana/web3.js";
import {
  DEFAULT_SOLANA_RPC_URL,
  DEFAULT_SOLANA_SETTLEMENT_WALLET,
  SOLANA_DEVNET_USDC_MINT
} from "@/lib/constants";
import { decimalToUsdcMicros } from "@/lib/money";
import type { Invoice } from "@/lib/types";

type CreateSolanaPayUrlInput = {
  recipient: string;
  amountUsdc: string;
  reference: string;
  itemName: string;
  merchantName: string;
};

export class PaymentNotFoundError extends Error {
  constructor(message = "No matching Solana payment was found yet.") {
    super(message);
    this.name = "PaymentNotFoundError";
  }
}

export function getSolanaUsdcMint() {
  return getEnvValue("NEXT_PUBLIC_SOLANA_USDC_MINT") ?? SOLANA_DEVNET_USDC_MINT;
}

export function getSolanaRecipient() {
  return getEnvValue("SOLANA_SETTLEMENT_WALLET") ?? DEFAULT_SOLANA_SETTLEMENT_WALLET;
}

export function generateSolanaReference() {
  return Keypair.generate().publicKey.toBase58();
}

export function createSolanaPayUrl(input: CreateSolanaPayUrlInput) {
  const url = new URL(`solana:${input.recipient}`);
  url.searchParams.set("amount", input.amountUsdc);
  url.searchParams.set("spl-token", getSolanaUsdcMint());
  url.searchParams.set("reference", input.reference);
  url.searchParams.set("label", input.merchantName);
  url.searchParams.set("message", `${input.itemName} via CREGI`);
  url.searchParams.set("memo", `cregi:${input.reference}`);
  return url.toString();
}

export async function findSolanaPayment(invoice: Invoice) {
  const connection = new Connection(
    getEnvValue("SOLANA_RPC_URL") ?? DEFAULT_SOLANA_RPC_URL,
    "confirmed"
  );

  const reference = new PublicKey(invoice.solanaReference);
  const signatures = await connection.getSignaturesForAddress(
    reference,
    { limit: 10 },
    "confirmed"
  );

  for (const signature of signatures) {
    if (signature.err) {
      continue;
    }

    const transaction = await connection.getParsedTransaction(signature.signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0
    });

    if (transaction && transferMatchesInvoice(transaction, invoice)) {
      return {
        signature: signature.signature,
        slot: signature.slot
      };
    }
  }

  throw new PaymentNotFoundError();
}

function transferMatchesInvoice(
  transaction: ParsedTransactionWithMeta,
  invoice: Invoice
) {
  const meta = transaction.meta;
  if (!meta) {
    return false;
  }

  const mint = getSolanaUsdcMint();
  const expectedAmount = decimalToUsdcMicros(invoice.amountUsdc);
  const preBalances = new Map<number, bigint>();

  for (const balance of meta.preTokenBalances ?? []) {
    if (balance.mint === mint) {
      preBalances.set(balance.accountIndex, BigInt(balance.uiTokenAmount.amount));
    }
  }

  for (const balance of meta.postTokenBalances ?? []) {
    if (balance.mint !== mint || balance.owner !== invoice.solanaRecipient) {
      continue;
    }

    const before = preBalances.get(balance.accountIndex) ?? 0n;
    const after = BigInt(balance.uiTokenAmount.amount);
    if (after - before >= expectedAmount) {
      return true;
    }
  }

  return false;
}

function getEnvValue(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}
