-- Tabla de evaluaciones por usuario
create table public.evaluaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  tema text not null,
  total_preguntas int not null,
  respuestas_correctas int not null,
  puntaje int not null,
  respuesta_neville_id text,
  created_at timestamptz default now()
);
alter table public.evaluaciones enable row level security;
create policy evaluaciones_own on public.evaluaciones
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tabla de rachas por usuario (una fila por usuario)
create table public.rachas (
  user_id uuid references auth.users primary key,
  racha_actual int not null default 0,
  racha_maxima int not null default 0,
  puntos_totales int not null default 0,
  ultima_evaluacion date,
  updated_at timestamptz default now()
);
alter table public.rachas enable row level security;
create policy rachas_own on public.rachas
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
