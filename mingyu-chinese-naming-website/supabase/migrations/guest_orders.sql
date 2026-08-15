create table if not exists public.guest_orders (
  id text primary key,
  access_token text not null,
  email text not null,
  tier text not null,
  price_value text not null,
  paypal_link text not null,
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

create index if not exists idx_guest_orders_email_created_at on public.guest_orders(email, created_at desc);
create index if not exists idx_guest_orders_access_token on public.guest_orders(access_token);

alter table public.guest_orders enable row level security;
