# Supabase Backend Setup

This document describes the Supabase backend setup for the HACCP Business Manager application.

## Overview

The application uses [Supabase](https://supabase.com) as the backend-as-a-service platform, providing:

- PostgreSQL database with advanced features
- Row Level Security (RLS) for multi-tenant data isolation
- Real-time subscriptions for live data updates
- File storage for images and documents
- Edge functions for custom server-side logic
- Built-in authentication integration

## Database Schema

### Core Tables

The database consists of 12 main tables organized for HACCP compliance:

#### Companies (`companies`)
- Multi-tenant isolation root table
- Stores business information and settings
- One-to-many relationship with all other entities

#### Users (`users`)
- Integrates with Clerk authentication via `clerk_user_id`
- Supports role-based access (admin, manager, employee, collaborator)
- Links to departments and companies

#### Departments (`departments`)
- Organizational structure within companies
- Supports manager assignment
- Used for task and user organization

#### Conservation Points (`conservation_points`)
- Core HACCP entities (fridges, freezers, storage areas)
- Temperature range definitions
- Product category associations
- Maintenance scheduling

#### Products (`products`)
- Inventory management
- Expiry date tracking
- Allergen information
- Links to conservation points and departments

#### Tasks (`tasks`)
- Maintenance and cleaning tasks
- Flexible assignment (user, role, or department)
- Frequency-based scheduling
- Priority levels

#### Task Completions (`task_completions`)
- Audit trail for completed tasks
- Photo evidence support
- Custom data fields via JSON

#### Temperature Readings (`temperature_readings`)
- HACCP compliance temperature logs
- Real-time monitoring data
- Range validation
- Photo evidence support

#### Non-Conformities (`non_conformities`)
- Issue tracking and resolution
- Severity classification
- Corrective action documentation
- Status workflow

#### Notes (`notes`)
- Communication system
- Context-aware (linked to entities)
- Mention system
- Announcements

#### Audit Logs (`audit_logs`)
- Complete audit trail
- Automatic logging via triggers
- IP address and user agent tracking
- Change history

#### Exports (`exports`)
- Data export management
- Multiple format support (JSON, CSV, PDF)
- Scheduled and on-demand exports

## Row Level Security (RLS)

### Multi-Tenant Isolation

All tables implement RLS policies that automatically filter data by `company_id`:

```sql
-- Example policy
CREATE POLICY "Users can view conservation points in their company" 
ON conservation_points
FOR SELECT USING (company_id = auth.get_user_company_id());
```

### Role-Based Access Control

Different policies based on user roles:

- **Admin**: Full access to company data
- **Manager**: Read/write access, limited user management
- **Employee**: Task completion, temperature logging, inventory
- **Collaborator**: Limited task completion and logging

### Helper Functions

Custom functions for policy enforcement:

- `auth.get_user_company_id()`: Extract company ID from JWT
- `auth.get_user_role()`: Extract user role from JWT
- `auth.is_admin()`: Check admin status
- `auth.is_manager_or_above()`: Check manager+ status

## Real-Time Features

### Subscriptions

Real-time data synchronization for:

- Conservation point changes
- Task updates
- Temperature readings
- Notifications

### Implementation

```javascript
// Subscribe to conservation point changes
const channel = subscriptionService.subscribeToConservationPoints((payload) => {
  const { eventType, new: newRecord, old: oldRecord } = payload
  // Handle real-time updates
})
```

## Storage Buckets

### Configured Buckets

- **product-images**: Product photos and labels
- **company-logos**: Company branding assets
- **documents**: HACCP documentation and reports

### Security

Storage buckets implement RLS policies matching database security:

- Company isolation
- Role-based access
- Automatic cleanup

## Environment Setup

### Required Environment Variables

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Supabase Project Setup

1. **Create Supabase Project**
   ```bash
   # Visit https://app.supabase.com
   # Create new project
   # Note the project URL and anon key
   ```

2. **Run Database Migrations**
   ```sql
   -- In Supabase SQL Editor, run in order:
   -- 1. supabase/migrations/001_initial_schema.sql
   -- 2. supabase/migrations/002_rls_policies.sql
   -- 3. supabase/seed.sql (optional, for development data)
   ```

3. **Configure Storage Buckets**
   ```bash
   # In Supabase Dashboard > Storage
   # Create buckets: product-images, company-logos, documents
   # Set appropriate RLS policies for each bucket
   ```

4. **Set up Edge Functions** (Optional)
   ```bash
   # For advanced features like automated reports
   npx supabase functions deploy
   ```

## Service Layer

### Architecture

The application uses a service layer pattern:

```
React Components
       ↓
Custom Hooks (useSupabase.js)
       ↓
Service Layer (supabaseService.js)
       ↓
Supabase Client (supabase-config.js)
       ↓
Supabase Backend
```

### Service Functions

Each entity has a dedicated service with CRUD operations:

- `companyService`: Company management
- `userService`: User operations
- `departmentService`: Department CRUD
- `conservationPointService`: Conservation point management
- `productService`: Inventory operations
- `taskService`: Task management
- `temperatureService`: Temperature logging
- `subscriptionService`: Real-time subscriptions

### Error Handling

All service functions include comprehensive error handling:

```javascript
async create(data) {
  try {
    const { data: result, error } = await db.insert(table, data)
    if (error) throw error
    return { data: result, error: null }
  } catch (error) {
    console.error(`Database error:`, error)
    return { data: null, error }
  }
}
```

## React Integration

### Custom Hooks

Entity-specific hooks for React integration:

- `useCompany()`: Company data and operations
- `useDepartments()`: Department management
- `useConservationPoints()`: Conservation point operations
- `useProducts()`: Product inventory
- `useTasks()`: Task management
- `useTemperatureReadings()`: Temperature monitoring

### Real-Time Updates

Hooks automatically subscribe to real-time updates:

```javascript
// Automatic real-time synchronization
const { conservationPoints, createConservationPoint } = useConservationPoints()
// Data automatically updates when changes occur in database
```

### Loading States

All hooks provide loading and error states:

```javascript
const { data, loading, error, refetch } = useConservationPoints()

if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
return <DataComponent data={data} />
```

## Performance Optimization

### Database Indexes

Optimized indexes for common queries:

```sql
-- Company-based filtering
CREATE INDEX idx_conservation_points_company_id ON conservation_points(company_id);

-- Time-based queries
CREATE INDEX idx_temperature_readings_recorded_at ON temperature_readings(recorded_at);

-- Expiry date queries
CREATE INDEX idx_products_expiry_date ON products(expiry_date) WHERE expiry_date IS NOT NULL;
```

### Query Optimization

- Selective column fetching
- Proper JOIN usage
- Pagination for large datasets
- Real-time subscription filtering

### Caching Strategy

- React Query for server state caching
- Local state for UI-specific data
- Real-time updates bypass cache

## Security Considerations

### Authentication Integration

- Seamless Clerk JWT integration
- Automatic token refresh
- Secure session management

### Data Protection

- All data encrypted at rest and in transit
- RLS policies prevent data leakage
- Audit trail for all operations
- IP address and user agent logging

### Input Validation

- Database-level constraints
- Application-level validation
- Parameterized queries prevent SQL injection
- File upload restrictions

## Monitoring and Maintenance

### Built-in Monitoring

Supabase provides:
- Query performance metrics
- Real-time connection monitoring
- Storage usage tracking
- Error logging

### Maintenance Tasks

Regular maintenance:
- Monitor query performance
- Review audit logs
- Clean up old temperature readings
- Archive completed exports
- Update RLS policies as needed

### Backup Strategy

- Automatic daily backups
- Point-in-time recovery
- Export functionality for compliance
- Data retention policies

## Migration Strategy

### From Legacy System

Migration utilities to convert:
- localStorage data to Supabase
- User accounts to Clerk integration
- File uploads to Supabase Storage
- Real-time sync implementation

### Database Migrations

Version-controlled schema changes:
- Sequential migration files
- Rollback procedures
- Data transformation scripts
- Testing procedures

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   ```
   Solution: Check JWT token and user permissions
   Verify company_id in user metadata
   ```

2. **Real-time Connection Issues**
   ```
   Solution: Check network connectivity
   Verify subscription filters
   Monitor connection limits
   ```

3. **Storage Upload Failures**
   ```
   Solution: Check file size limits
   Verify bucket permissions
   Review file type restrictions
   ```

### Debugging Tools

- Supabase Dashboard SQL Editor
- Real-time Inspector
- Storage Explorer
- Logs and Analytics

This comprehensive backend setup provides a robust, scalable foundation for the HACCP Business Manager application with enterprise-grade security and performance.