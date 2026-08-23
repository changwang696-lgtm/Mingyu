create table if not exists public.member_orders (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  item_type text not null,
  item_id text not null,
  item_name text not null,
  amount text not null,
  currency text not null default 'USD',
  credits_delta integer not null default 0,
  status text not null default 'pending_payment',
  paypal_order_id text,
  paypal_capture_id text,
  membership_plan_id text,
  membership_plan_name text,
  membership_renewal_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_member_orders_user_created_at on public.member_orders(user_id, created_at desc);
create index if not exists idx_member_orders_paypal_order_id on public.member_orders(paypal_order_id);

alter table public.member_orders enable row level security;
