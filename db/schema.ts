import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  merchantName: text("merchant_name").notNull(),
  itemName: text("item_name").notNull(),
  amountUsdc: text("amount_usdc").notNull(),
  solanaReference: text("solana_reference").notNull().unique(),
  solanaRecipient: text("solana_recipient").notNull(),
  solanaPaymentUrl: text("solana_payment_url").notNull(),
  solanaTx: text("solana_tx"),
  avalancheMerchantAddress: text("avalanche_merchant_address").notNull(),
  avalancheTx: text("avalanche_tx"),
  circleTransferId: text("circle_transfer_id"),
  status: text("status").notNull().default("awaiting_payment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoiceRow = typeof invoices.$inferInsert;
