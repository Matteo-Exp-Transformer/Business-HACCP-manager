# Supabase Setup Guide (A.1.3)

Follow these steps to create and configure your Supabase project.

## 1) Create Project
1. Go to https://supabase.com and create a project
2. Note the Project URL and generate an Anon and Service Role key

## 2) Environment Variables
Copy the example and set your keys:
```
cp .env.example .env.local
```
Update `.env.local`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3) Link Supabase CLI (optional)
Install CLI and link your project:
```
npm i -g supabase
supabase login
supabase link --project-ref your-project-ref
```

## 4) Apply Migrations
From project root:
```
supabase db push
```
This applies:
- migrations/0001_initial_schema.sql
- migrations/0002_rls_policies.sql
- migrations/0003_pgvector.sql (if present)

## 5) JWT Claims (RLS)
Set a custom JWT claim `company_id` for tenant isolation. Configure your auth/JWT to include:
```
{
  "company_id": "<tenant-uuid>"
}
```

## 6) Storage Bucket (labels)
Create a bucket named `labels` for product label uploads. You can do this in the Supabase dashboard (Storage) or via API with a Service Role key.

## 7) Verify
- Run the app with `.env.local` in place
- Ensure realtime works and CRUD operations are scoped to your company