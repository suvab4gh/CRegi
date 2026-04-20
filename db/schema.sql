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
);

create index if not exists invoices_created_at_idx on invoices (created_at desc);
create index if not exists invoices_status_idx on invoices (status);
