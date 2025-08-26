-- Create tables referenced by the mobile app if they don't exist

-- deadlines table
create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  deadline_type varchar check (deadline_type in ('essay','lor','test','application','other')),
  priority varchar check (priority in ('low','medium','high','critical')) default 'medium',
  deadline_date date not null,
  notes text,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar not null,
  type varchar not null,
  content text,
  status varchar check (status in ('draft','in_review','final')) default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- user_application_progress table
create table if not exists public.user_application_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mba_school_id uuid not null references public.mba_schools(id) on delete cascade,
  application_status varchar check (application_status in ('not_started','in_progress','submitted','interviewed','admitted','rejected','deferred','waitlisted')) default 'not_started',
  overall_completion_percentage int default 0 check (overall_completion_percentage between 0 and 100),
  essays_completion_percentage int default 0 check (essays_completion_percentage between 0 and 100),
  lors_completion_percentage int default 0 check (lors_completion_percentage between 0 and 100),
  notes text,
  priority_level int default 5 check (priority_level between 1 and 10),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies (basic)
alter table public.deadlines enable row level security;
create policy if not exists "deadlines_select_own" on public.deadlines for select using (auth.uid() = user_id);
create policy if not exists "deadlines_modify_own" on public.deadlines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.documents enable row level security;
create policy if not exists "documents_select_own" on public.documents for select using (auth.uid() = user_id);
create policy if not exists "documents_modify_own" on public.documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.user_application_progress enable row level security;
create policy if not exists "uap_select_own" on public.user_application_progress for select using (auth.uid() = user_id);
create policy if not exists "uap_modify_own" on public.user_application_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
