create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  plan_id text not null,
  status text not null default 'active',
  pasarela text not null,
  pasarela_subscription_id text,
  current_period_end timestamptz,
  incluye_talleres boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.subscriptions enable row level security;
create policy subscriptions_own
  on public.subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
