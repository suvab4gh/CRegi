import "server-only";

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { invoices, type InvoiceRow, type NewInvoiceRow } from "@/db/schema";
import { DEMO_AVALANCHE_MERCHANT } from "@/lib/constants";
import { normalizeUsdcAmount } from "@/lib/money";
import {
  createSolanaPayUrl,
  generateSolanaReference,
  getSolanaRecipient
} from "@/lib/solana/payments";
import type { CreateInvoiceInput, Invoice, InvoiceStatus } from "@/lib/types";

const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;
const db = sql ? drizzle(sql, { schema: { invoices } }) : null;
let schemaReady: Promise<void> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var cregiInvoices: Map<string, Invoice> | undefined;
}

const memoryInvoices =
  globalThis.cregiInvoices ?? new Map<string, Invoice>();

if (!globalThis.cregiInvoices) {
  globalThis.cregiInvoices = memoryInvoices;
  seedMemoryInvoices();
}

export function hasPersistentDatabase() {
  return Boolean(db);
}

export async function listInvoices() {
  if (db) {
    await ensureDatabaseSchema();
    const rows = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
    return rows.map(rowToInvoice);
  }

  return [...memoryInvoices.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function getInvoice(id: string) {
  if (db) {
    await ensureDatabaseSchema();
    const [row] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    return row ? rowToInvoice(row) : null;
  }

  return memoryInvoices.get(id) ?? null;
}

export async function createInvoice(input: CreateInvoiceInput) {
  const now = new Date();
  const reference = generateSolanaReference();
  const amountUsdc = normalizeUsdcAmount(input.amountUsdc);
  const solanaRecipient = getSolanaRecipient();

  const invoice: Invoice = {
    id: `cr_${randomUUID().split("-")[0]}`,
    merchantName: input.merchantName.trim(),
    itemName: input.itemName.trim(),
    amountUsdc,
    solanaReference: reference,
    solanaRecipient,
    solanaPaymentUrl: createSolanaPayUrl({
      recipient: solanaRecipient,
      amountUsdc,
      reference,
      itemName: input.itemName.trim(),
      merchantName: input.merchantName.trim()
    }),
    solanaTx: null,
    avalancheMerchantAddress: input.avalancheMerchantAddress.trim(),
    avalancheTx: null,
    circleTransferId: null,
    status: "awaiting_payment",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  if (db) {
    await ensureDatabaseSchema();
    const [row] = await db.insert(invoices).values(invoiceToRow(invoice)).returning();
    return rowToInvoice(row);
  }

  memoryInvoices.set(invoice.id, invoice);
  return invoice;
}

export async function updateInvoice(
  id: string,
  patch: Partial<
    Pick<
      Invoice,
      "status" | "solanaTx" | "avalancheTx" | "circleTransferId" | "updatedAt"
    >
  >
) {
  const updatedAt = new Date();

  if (db) {
    await ensureDatabaseSchema();
    const [row] = await db
      .update(invoices)
      .set({
        ...patch,
        updatedAt
      })
      .where(eq(invoices.id, id))
      .returning();
    return row ? rowToInvoice(row) : null;
  }

  const current = memoryInvoices.get(id);
  if (!current) {
    return null;
  }

  const next: Invoice = {
    ...current,
    ...patch,
    updatedAt: updatedAt.toISOString()
  };
  memoryInvoices.set(id, next);
  return next;
}

function rowToInvoice(row: InvoiceRow): Invoice {
  return {
    ...row,
    status: row.status as InvoiceStatus,
    solanaTx: row.solanaTx ?? null,
    avalancheTx: row.avalancheTx ?? null,
    circleTransferId: row.circleTransferId ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function invoiceToRow(invoice: Invoice): NewInvoiceRow {
  return {
    ...invoice,
    createdAt: new Date(invoice.createdAt),
    updatedAt: new Date(invoice.updatedAt)
  };
}

async function ensureDatabaseSchema() {
  if (!sql) {
    return;
  }

  schemaReady ??= (async () => {
    await sql`
      create table if not exists invoices (
        id text primary key,
        merchant_name text not null,
        item_name text not null,
        amount_usdc text not null,
        solana_reference text not null unique,
        solana_recipient text not null,
        solana_payment_url text not null,
        solana_tx text,
        avalanche_merchant_address text not null,
        avalanche_tx text,
        circle_transfer_id text,
        status text not null default 'awaiting_payment',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;
    await sql`
      create index if not exists invoices_created_at_idx
      on invoices (created_at desc)
    `;
    await sql`
      create index if not exists invoices_status_idx
      on invoices (status)
    `;
  })();

  await schemaReady;
}

function seedMemoryInvoices() {
  const demoInputs: CreateInvoiceInput[] = [
    {
      merchantName: "SCBC Coffee Bar",
      itemName: "Builder espresso tab",
      amountUsdc: "5.00",
      avalancheMerchantAddress: DEMO_AVALANCHE_MERCHANT
    },
    {
      merchantName: "USC Expo Booth",
      itemName: "Workshop merch pass",
      amountUsdc: "12.50",
      avalancheMerchantAddress: DEMO_AVALANCHE_MERCHANT
    }
  ];

  for (const input of demoInputs) {
    const now = new Date(Date.now() - memoryInvoices.size * 70_000);
    const reference = generateSolanaReference();
    const amountUsdc = normalizeUsdcAmount(input.amountUsdc);
    const solanaRecipient = getSolanaRecipient();
    const invoice: Invoice = {
      id: `demo_${memoryInvoices.size + 1}`,
      merchantName: input.merchantName,
      itemName: input.itemName,
      amountUsdc,
      solanaReference: reference,
      solanaRecipient,
      solanaPaymentUrl: createSolanaPayUrl({
        recipient: solanaRecipient,
        amountUsdc,
        reference,
        itemName: input.itemName,
        merchantName: input.merchantName
      }),
      solanaTx: null,
      avalancheMerchantAddress: input.avalancheMerchantAddress,
      avalancheTx: null,
      circleTransferId: null,
      status: "awaiting_payment",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    memoryInvoices.set(invoice.id, invoice);
  }
}
