-- HACCP Business Manager - Initial Schema (A.1.3)
-- PostgreSQL 15+ compatible

-- Extensions
create extension if not exists pgcrypto;

-- Companies (tenant)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  address text,
  email text,
  phone text,
  vat_number text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Users (application users; may reference auth.users via auth_user_id)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  auth_user_id uuid unique,
  full_name text,
  email text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Departments
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conservation Points
create table if not exists public.conservation_points (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  name text not null,
  category text not null, -- room | fridge | freezer | blast_chiller
  min_temp numeric,
  max_temp numeric,
  is_room boolean not null default false,
  is_blast_chiller boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Staff Members
create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null,
  role text not null,
  category text,
  haccp_certified boolean not null default false,
  certification_expiry date,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks (maintenance + general)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  type text not null default 'generic', -- maintenance | generic
  frequency text, -- daily | weekly | monthly | yearly | custom
  assigned_staff_id uuid references public.staff_members(id) on delete set null,
  assigned_role text,
  due_at timestamptz,
  status text not null default 'pending', -- pending | done | overdue
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Task Completions
create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  completed_by uuid references public.staff_members(id) on delete set null,
  completed_at timestamptz not null default now(),
  notes text,
  evidence_url text,
  created_at timestamptz not null default now()
);

-- Audit Logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  changes jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_users_company on public.users(company_id);
create index if not exists idx_departments_company on public.departments(company_id);
create index if not exists idx_conservation_points_company on public.conservation_points(company_id);
create index if not exists idx_staff_members_company on public.staff_members(company_id);
create index if not exists idx_tasks_company on public.tasks(company_id);
create index if not exists idx_task_completions_task on public.task_completions(task_id);
create index if not exists idx_audit_logs_company on public.audit_logs(company_id);

-- Note: RLS policies will be added in a separate migration (A.1.3 task)
