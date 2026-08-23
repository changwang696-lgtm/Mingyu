create table if not exists public.guest_orders (
  id text primary key,
  access_token text not null,
  email text not null,
  tier text not null,
  price_value text not null,
  paypal_link text,
  input_name text not null,
  form_body jsonb not null,
  status text not null default 'pending_payment',
  result jsonb,
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  payment_confirmed_at timestamptz
);

alter table public.guest_orders add column if not exists email_sent_at timestamptz;
alter table public.guest_orders add column if not exists email_delivery_status text default 'pending';
alter table public.guest_orders add column if not exists email_delivery_error text;
alter table public.guest_orders add column if not exists user_id text;
alter table public.guest_orders add column if not exists paypal_order_id text;
alter table public.guest_orders add column if not exists paypal_capture_id text;
alter table public.guest_orders add column if not exists payment_status text default 'pending';
alter table public.guest_orders add column if not exists payment_amount text;
alter table public.guest_orders add column if not exists payment_currency text default 'USD';
alter table public.guest_orders add column if not exists pdf_base64 text;
alter table public.guest_orders add column if not exists pdf_file_name text;
alter table public.guest_orders add column if not exists pdf_generated_at timestamptz;
alter table public.guest_orders alter column paypal_link drop not null;

create index if not exists idx_guest_orders_email_created_at on public.guest_orders(email, created_at desc);
create index if not exists idx_guest_orders_user_created_at on public.guest_orders(user_id, created_at desc);
create index if not exists idx_guest_orders_access_token on public.guest_orders(access_token);
create index if not exists idx_guest_orders_paypal_order_id on public.guest_orders(paypal_order_id);

alter table public.guest_orders enable row level security;
