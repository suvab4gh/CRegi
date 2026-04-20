import { pgTable, text, timestamp, uuid, decimal } from 'drizzle-orm/pg-core';

export const merchants = pgTable('merchants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  avalancheAddress: text('avalanche_address').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  merchantId: uuid('merchant_id').references(() => merchants.id),
  itemName: text('item_name').notNull(),
  amountUsdc: decimal('amount_usdc', { precision: 20, scale: 6 }).notNull(),
  status: text('status', { enum: ['created', 'awaiting_payment', 'paid_on_solana', 'settling', 'settled_on_avalanche', 'failed'] }).default('created'),
  solanaReference: text('solana_reference').unique(),
  solanaRecipient: text('solana_recipient'),
  solanaTx: text('solana_tx'),
  avalancheTx: text('avalanche_tx'),
  circleTransferId: text('circle_transfer_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
