-- HACCP Business Manager - pgvector setup (A.1.3)

create extension if not exists vector;

create table if not exists public.embeddings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  embedding vector(1536) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_embeddings_company on public.embeddings(company_id);
-- Optional: requires ivfflat index support and suitable maintenance settings
-- create index if not exists idx_embeddings_vector on public.embeddings using ivfflat (embedding vector_cosine_ops);

