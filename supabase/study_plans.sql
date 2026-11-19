-- PREPARA: planos de estudo dos estudantes
create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  goal text not null,
  academic_level text not null,
  exam_type text not null,
  exam_date date not null,
  subjects text[] not null default '{}',
  hours_per_day numeric(3,1) not null check (hours_per_day > 0 and hours_per_day <= 12),
  knowledge_level text not null,
  schedule jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists study_plans_user_created_idx
  on public.study_plans(user_id, created_at desc);

alter table public.study_plans enable row level security;

drop policy if exists "Students can read own study plans" on public.study_plans;
create policy "Students can read own study plans"
  on public.study_plans for select
  using (auth.uid() = user_id);

drop policy if exists "Students can create own study plans" on public.study_plans;
create policy "Students can create own study plans"
  on public.study_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "Students can update own study plans" on public.study_plans;
create policy "Students can update own study plans"
  on public.study_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Students can delete own study plans" on public.study_plans;
create policy "Students can delete own study plans"
  on public.study_plans for delete
  using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.study_plans to authenticated;
