-- ============================================================
-- MIGRATION 002 — Memoria RLS + mi_libro_capitulos
-- Correr en el SQL editor de Supabase (https://supabase.com/dashboard/project/qitwckfwmgnmnmtjhfnf/sql)
-- ============================================================

-- 1. RLS policy en tabla memoria existente
-- (ejecutar solo si no existe ya una policy con este nombre)
create policy memoria_own_all
  on public.memoria
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Tabla nueva para capítulos de Mi libro
create table public.mi_libro_capitulos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  titulo text not null,
  contenido text not null default '',
  orden int not null default 0,
  memorias_origen uuid[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.mi_libro_capitulos enable row level security;

create policy mi_libro_capitulos_own_all
  on public.mi_libro_capitulos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
