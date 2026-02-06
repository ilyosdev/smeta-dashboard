# Authentication System

This directory contains the JWT-based authentication system for the Smetakon dashboard.

## Files

### `tokens.ts`
Token management utilities for localStorage:
- `getAccessToken()` - Get stored access token
- `getRefreshToken()` - Get stored refresh token
- `setTokens(access, refresh)` - Store both tokens
- `clearTokens()` - Remove all tokens
- `isTokenExpired(token)` - Check if JWT token is expired

### `auth-context.tsx`
React context providing authentication state and methods:
- `user` - Current user object (null if not authenticated)
- `isLoading` - Loading state during auth operations
- `isAuthenticated` - Boolean indicating auth status
- `login(phone, password)` - Login with credentials
- `logout()` - Clear tokens and user state
- `refreshAuth()` - Reload user profile from API

### `auth-guard.tsx`
Protected route component:
- Redirects to /login if not authenticated
- Shows loading spinner while checking auth
- Use to wrap dashboard pages

### `use-auth.ts`
Custom hook re-export for convenience

### `index.ts`
Main exports for easy importing

## Usage

### 1. Wrap app with AuthProvider

Already configured in `apps/dashboard/src/app/layout.tsx`:

```tsx
import { AuthProvider } from '@/lib/auth';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Protect dashboard routes with AuthGuard

Already configured in `apps/dashboard/src/app/(dashboard)/layout.tsx`:

```tsx
import { AuthGuard } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      {/* dashboard content */}
    </AuthGuard>
  );
}
```

### 3. Use authentication in components

```tsx
import { useAuth } from '@/lib/auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Authentication Flow

1. User submits login form with phone + password
2. `login()` function calls `/vendor/auth/login` endpoint
3. Backend returns `{ accessToken, refreshToken, user }`
4. Tokens are stored in localStorage via `setTokens()`
5. User object is stored in context state
6. On subsequent requests, access token is included in headers (via `apiClient`)
7. If token expires, `refreshToken()` is called automatically
8. If refresh fails, user is logged out and redirected to /login

## API Endpoints

The auth system expects these backend endpoints:

- `POST /vendor/auth/login` - Login with phone/password
  - Request: `{ phone: string, password: string }`
  - Response: `{ accessToken, refreshToken, user }`

- `POST /vendor/auth/refresh` - Refresh access token
  - Request: `{ refreshToken: string }`
  - Response: `{ accessToken, refreshToken }`

- `GET /vendor/auth/profile` - Get user profile
  - Headers: `Authorization: Bearer {accessToken}`
  - Response: `{ id, name, phone, role, orgId }`

## Token Storage

Tokens are stored in localStorage:
- `accessToken` - Short-lived JWT for API requests
- `refreshToken` - Long-lived token for getting new access tokens

## Security Notes

- Access tokens are automatically included in API requests
- Expired tokens trigger automatic refresh
- Failed refresh triggers logout and redirect to /login
- Tokens are cleared on logout
- AuthGuard prevents unauthorized access to protected routes
