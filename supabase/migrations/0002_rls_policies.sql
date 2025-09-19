-- HACCP Business Manager - RLS Policies (A.1.3)

-- Enable RLS on tables
alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.departments enable row level security;
alter table public.conservation_points enable row level security;
alter table public.staff_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.audit_logs enable row level security;

-- For simplicity, assume a JWT claim company_id is set in the client session
-- Policies: each tenant can only access rows with matching company_id

-- Companies: restrict to the single company by id via claim
create policy if not exists companies_select on public.companies
  for select using (id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));

create policy if not exists companies_modify on public.companies
  for all using (id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''))
  with check (id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));

-- Generic helper expression for company_id match
-- Note: for companies table we matched by id; for others, company_id column exists

create policy if not exists users_tenant_select on public.users
  for select using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));
create policy if not exists users_tenant_modify on public.users
  for all using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''))
  with check (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));

create policy if not exists departments_tenant_select on public.departments
  for select using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));
create policy if not exists departments_tenant_modify on public.departments
  for all using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''))
  with check (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));

create policy if not exists conservation_points_tenant_select on public.conservation_points
  for select using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));
create policy if not exists conservation_points_tenant_modify on public.conservation_points
  for all using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''))
  with check (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));

create policy if not exists staff_members_tenant_select on public.staff_members
  for select using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));
create policy if not exists staff_members_tenant_modify on public.staff_members
  for all using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''))
  with check (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));

create policy if not exists tasks_tenant_select on public.tasks
  for select using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));
create policy if not exists tasks_tenant_modify on public.tasks
  for all using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''))
  with check (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));

create policy if not exists task_completions_tenant_select on public.task_completions
  for select using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));
create policy if not exists task_completions_tenant_modify on public.task_completions
  for all using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''))
  with check (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));

create policy if not exists audit_logs_tenant_select on public.audit_logs
  for select using (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));
create policy if not exists audit_logs_tenant_insert on public.audit_logs
  for insert with check (company_id::text = coalesce(current_setting('request.jwt.claims', true)::jsonb->>'company_id', ''));

