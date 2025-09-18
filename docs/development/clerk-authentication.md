# Clerk Authentication Integration

This document describes the Clerk authentication integration for the HACCP Business Manager application.

## Overview

The application uses [Clerk](https://clerk.com) for authentication, providing:

- Email/password authentication
- Role-based access control (RBAC)
- Multi-tenant support
- Optional MFA for administrators
- JWT token handling
- Session management

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
```

### 2. Clerk Dashboard Configuration

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure authentication methods (email/password recommended)
3. Set up user metadata fields for roles and company association
4. Configure webhooks for user management (optional)

## User Roles

The application supports four user roles:

### Admin (`admin`)
- Full system access
- User management
- Department management
- Settings configuration
- Data export
- All other permissions

### Manager (`manager`)
- View all data
- Manage tasks and assignments
- Manage inventory
- Manage conservation points
- View reports
- No user management

### Employee (`employee`)
- View assigned tasks
- Complete tasks
- Log temperatures
- Manage assigned inventory
- View own data only

### Collaborator (`collaborator`)
- View assigned tasks
- Complete tasks
- Log temperatures
- View own data only
- Limited permissions

## Role Assignment

User roles are stored in Clerk's `publicMetadata` field:

```javascript
{
  "role": "admin",
  "companyId": "company-123"
}
```

## Components

### AuthProvider
Wraps the application with Clerk authentication:

```jsx
import { AuthProvider } from './features/auth'

function App() {
  return (
    <AuthProvider>
      {/* Your app content */}
    </AuthProvider>
  )
}
```

### AuthButton
Displays sign in/out button based on authentication state:

```jsx
import { AuthButton } from './features/auth'

function Header() {
  return (
    <header>
      <AuthButton />
    </header>
  )
}
```

### ProtectedRoute
Protects routes based on authentication and permissions:

```jsx
import { ProtectedRoute } from './features/auth'

function AdminPanel() {
  return (
    <ProtectedRoute adminOnly>
      <div>Admin-only content</div>
    </ProtectedRoute>
  )
}

function ManagementSection() {
  return (
    <ProtectedRoute requiredPermission="manage_users">
      <div>User management content</div>
    </ProtectedRoute>
  )
}
```

## Hooks

### useAuth
Custom hook providing authentication utilities:

```jsx
import { useAuth } from './features/auth'

function MyComponent() {
  const { 
    isSignedIn, 
    user, 
    userRole, 
    isAdmin,
    hasPermission,
    canManageUsers 
  } = useAuth()

  if (!isSignedIn) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <p>Role: {userRole}</p>
      {isAdmin && <p>You are an administrator</p>}
      {canManageUsers() && <button>Manage Users</button>}
    </div>
  )
}
```

## Permissions

### Available Permissions

- `manage_users` - Create, edit, delete users
- `manage_departments` - Manage department structure
- `manage_settings` - Access system settings
- `view_all_data` - View data across all departments
- `export_data` - Export system data
- `manage_conservation_points` - Manage temperature monitoring points
- `manage_tasks` - Create and assign tasks
- `manage_inventory` - Manage inventory items
- `view_reports` - Access reporting features
- `view_assigned_tasks` - View tasks assigned to user
- `complete_tasks` - Mark tasks as complete
- `log_temperatures` - Record temperature readings
- `view_own_data` - View user's own data only

### Permission Checking

```jsx
import { useAuth } from './features/auth'

function TaskManager() {
  const { hasPermission } = useAuth()

  return (
    <div>
      {hasPermission('manage_tasks') && (
        <button>Create New Task</button>
      )}
      {hasPermission('view_assigned_tasks') && (
        <div>Your assigned tasks...</div>
      )}
    </div>
  )
}
```

## Multi-Tenancy

Users are associated with companies through the `companyId` field in their metadata:

```javascript
{
  "role": "admin",
  "companyId": "restaurant-abc-123"
}
```

This ensures data isolation between different restaurant organizations.

## Error Handling

The application includes error boundaries and fallback UI for authentication errors:

- Loading states while authentication loads
- Fallback UI for unauthenticated users
- Permission denied messages
- Error recovery mechanisms

## Testing

Authentication utilities are fully tested:

```bash
npm run test tests/unit/auth.test.js
```

## Security Considerations

- JWT tokens are handled securely by Clerk
- Role assignments should be managed server-side
- Sensitive operations require additional verification
- Regular security audits recommended
- HTTPS required in production

## Migration from Legacy System

The application includes migration utilities to convert from the previous PIN-based system to Clerk authentication. See the migration guide for details.