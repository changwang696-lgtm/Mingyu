create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id text primary key,
  email text not null unique,
  display_name text not null,
  password_hash text not null,
  password_salt text not null,
  credits_balance integer not null default 0,
  membership jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.app_sessions (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.credit_ledger (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  entry_type text not null,
  source text not null,
  description text not null,
  credits_delta integer not null,
  credits_balance_after integer not null,
  reference_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.naming_reports (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  tier text not null,
  input_name text not null,
  zodiac text not null,
  preview_names jsonb not null default '[]'::jsonb,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_app_users_email on public.app_users(email);
create index if not exists idx_app_sessions_user_id on public.app_sessions(user_id);
create index if not exists idx_app_sessions_expires_at on public.app_sessions(expires_at);
create index if not exists idx_credit_ledger_user_created_at on public.credit_ledger(user_id, created_at desc);
create index if not exists idx_naming_reports_user_created_at on public.naming_reports(user_id, created_at desc);

alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.naming_reports enable row level security;

create or replace function public.app_register_user(
  p_user_id text,
  p_email text,
  p_display_name text,
  p_password_hash text,
  p_password_salt text,
  p_welcome_credits integer
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_membership jsonb;
begin
  v_membership := jsonb_build_object(
    'planId', null,
    'planName', 'No active membership',
    'status', 'inactive',
    'renewalAt', null,
    'cancelAtPeriodEnd', false
  );

  insert into public.app_users (
    id,
    email,
    display_name,
    password_hash,
    password_salt,
    credits_balance,
    membership
  ) values (
    p_user_id,
    lower(trim(p_email)),
    p_display_name,
    p_password_hash,
    p_password_salt,
    p_welcome_credits,
    v_membership
  );

  insert into public.credit_ledger (
    id,
    user_id,
    entry_type,
    source,
    description,
    credits_delta,
    credits_balance_after
  ) values (
    'ledger_' || replace(gen_random_uuid()::text, '-', ''),
    p_user_id,
    'grant',
    'welcome',
    'Welcome credits for new account',
    p_welcome_credits,
    p_welcome_credits
  );

  return jsonb_build_object(
    'user_id', p_user_id,
    'credits_balance', p_welcome_credits
  );
end;
$$;

create or replace function public.app_consume_credits_and_store_report(
  p_user_id text,
  p_cost integer,
  p_tier text,
  p_input_name text,
  p_zodiac text,
  p_preview_names jsonb,
  p_result jsonb
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_current_balance integer;
  v_remaining integer;
  v_report_id text;
begin
  select credits_balance
  into v_current_balance
  from public.app_users
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Account not found.';
  end if;

  if v_current_balance < p_cost then
    raise exception 'Not enough credits.';
  end if;

  v_remaining := v_current_balance - p_cost;
  v_report_id := 'report_' || replace(gen_random_uuid()::text, '-', '');

  update public.app_users
  set credits_balance = v_remaining
  where id = p_user_id;

  insert into public.credit_ledger (
    id,
    user_id,
    entry_type,
    source,
    description,
    credits_delta,
    credits_balance_after,
    reference_id
  ) values (
    'ledger_' || replace(gen_random_uuid()::text, '-', ''),
    p_user_id,
    'usage',
    'generation',
    'Used ' || p_cost || ' credits for ' || p_tier || ' generation',
    -p_cost,
    v_remaining,
    v_report_id
  );

  insert into public.naming_reports (
    id,
    user_id,
    tier,
    input_name,
    zodiac,
    preview_names,
    result
  ) values (
    v_report_id,
    p_user_id,
    p_tier,
    p_input_name,
    p_zodiac,
    coalesce(p_preview_names, '[]'::jsonb),
    p_result
  );

  return jsonb_build_object(
    'remaining_credits', v_remaining,
    'report_id', v_report_id
  );
end;
$$;
