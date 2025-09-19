# Supabase Backend Setup (A.1.3)

This folder contains database migrations for the HACCP Business Manager.

## Prerequisites
- PostgreSQL 15+ (Supabase project recommended)
- Supabase CLI installed

## Usage

1. Copy environment variables:
```
cp .env.example .env.local
```

2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.

3. Create a Supabase project and link with CLI:
```
supabase link --project-ref your-project-ref
```

4. Apply migrations:
```
supabase db push
```

## Contents
- migrations/0001_initial_schema.sql: Core tables (companies, users, departments, conservation_points, staff_members, tasks, task_completions, audit_logs)

RLS policies will be added in a dedicated migration.