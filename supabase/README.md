# HACCP Business Manager - Database Setup

This directory contains the database schema and configuration for the HACCP Business Manager application.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and API keys

## Database Structure

### Core Tables

- **companies**: Multi-tenant company management
- **users**: User accounts linked to Clerk authentication
- **departments**: Organizational departments
- **conservation_points**: Temperature monitoring locations (fridges, freezers, etc.)
- **products**: Inventory management with allergen tracking
- **tasks**: Maintenance and general tasks
- **task_completions**: Task execution tracking
- **temperature_readings**: Temperature log entries
- **non_conformities**: Issue tracking
- **notes**: Internal communication system
- **audit_logs**: Complete audit trail
- **exports**: Data export history

### Security

- Row Level Security (RLS) enabled on all tables
- Multi-tenant data isolation
- Role-based access control (admin, manager, employee, collaborator)

## Setup Instructions

### 1. Run Migrations

In your Supabase project dashboard:

1. Go to SQL Editor
2. Create a new query
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Run the query
5. Repeat for `migrations/002_row_level_security.sql`

### 2. Load Seed Data (Optional)

For development/testing:

1. In SQL Editor, create a new query
2. Copy and paste the contents of `seed.sql`
3. Run the query

### 3. Configure Environment Variables

Add to your `.env.local`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Enable Realtime (Optional)

For real-time features:

1. Go to Database > Replication
2. Enable replication for tables:
   - temperature_readings
   - task_completions
   - notes

## Migration Management

### Creating New Migrations

Name migrations sequentially:
- `003_add_feature_x.sql`
- `004_update_table_y.sql`

### Running Migrations in Production

Use Supabase CLI or dashboard to apply migrations in order.

## Backup Strategy

1. Enable Point-in-Time Recovery in Supabase dashboard
2. Set up daily backups
3. Test restore procedures regularly

## Performance Considerations

- Indexes are created on all foreign keys and commonly queried fields
- Consider partitioning large tables (temperature_readings, audit_logs) after 1M+ rows
- Monitor query performance in Supabase dashboard

## Troubleshooting

### Common Issues

1. **RLS policies blocking access**: Check auth token and user role
2. **Migration fails**: Ensure migrations are run in order
3. **Performance issues**: Check indexes and analyze query plans

### Debug Queries

```sql
-- Check current user's company
SELECT auth.company_id();

-- Check current user's role
SELECT auth.user_role();

-- List all policies for a table
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

## Support

For database-related issues:
- Check Supabase documentation
- Review RLS policies
- Verify Clerk integration