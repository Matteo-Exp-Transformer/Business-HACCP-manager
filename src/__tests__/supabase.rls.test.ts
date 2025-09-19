import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(__dirname, '../../..')

describe('Supabase migrations', () => {
  it('has initial schema migration', () => {
    const p = path.join(ROOT, 'supabase/migrations/0001_initial_schema.sql')
    const exists = fs.existsSync(p)
    expect(exists).toBe(true)
    const sql = fs.readFileSync(p, 'utf-8')
    expect(sql).toContain('create table if not exists public.companies')
    expect(sql).toContain('create table if not exists public.users')
  })

  it('has RLS policies migration', () => {
    const p = path.join(ROOT, 'supabase/migrations/0002_rls_policies.sql')
    const exists = fs.existsSync(p)
    expect(exists).toBe(true)
    const sql = fs.readFileSync(p, 'utf-8')
    expect(sql).toContain('enable row level security')
    expect(sql).toContain('create policy')
  })
})

