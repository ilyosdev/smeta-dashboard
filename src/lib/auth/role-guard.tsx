import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context';

// Role hierarchy
const ROLE_HIERARCHY: Record<string, string[]> = {
  SUPER_ADMIN: ['SUPER_ADMIN', 'OPERATOR', 'DIREKTOR', 'BOSS', 'BUGALTERIYA', 'PTO', 'SNABJENIYA', 'SKLAD', 'PRORAB'],
  OPERATOR: ['OPERATOR'],
  DIREKTOR: ['DIREKTOR', 'PRORAB', 'SNABJENIYA', 'SKLAD', 'BUGALTERIYA', 'PTO', 'BOSS'],
  BOSS: ['DIREKTOR', 'PRORAB', 'SNABJENIYA', 'SKLAD', 'BUGALTERIYA', 'PTO', 'BOSS'],
  PRORAB: ['PRORAB'],
  SNABJENIYA: ['SNABJENIYA'],
  SKLAD: ['SKLAD'],
  BUGALTERIYA: ['BUGALTERIYA'],
  PTO: ['PTO'],
};

export function hasRole(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;

  // Check if user's role is in allowed roles
  if (allowedRoles.includes(userRole)) return true;

  // Check role hierarchy - DIREKTOR and BOSS can access everything
  const inheritedRoles = ROLE_HIERARCHY[userRole] || [];
  return allowedRoles.some(role => inheritedRoles.includes(role));
}

export function canAccessRoute(userRole: string | undefined, pathname: string): boolean {
  if (!userRole) return false;

  // Routes with role restrictions
  const routeRoles: Record<string, string[]> = {
    '/admin/operators': ['SUPER_ADMIN'],
    '/admin': ['SUPER_ADMIN', 'OPERATOR'],
    '/users': ['DIREKTOR', 'BOSS'],
    '/kassa': ['DIREKTOR', 'BOSS', 'BUGALTERIYA', 'PTO', 'SNABJENIYA', 'SKLAD', 'PRORAB'],
    '/finance': ['DIREKTOR', 'BOSS', 'BUGALTERIYA'],
    '/warehouse': ['DIREKTOR', 'BOSS', 'SKLAD'],
    '/suppliers': ['DIREKTOR', 'BOSS', 'SNABJENIYA'],
    '/workers': ['DIREKTOR', 'BOSS', 'PRORAB', 'BUGALTERIYA'],
    '/validation': ['DIREKTOR', 'BOSS', 'PTO'],
    '/reports': ['DIREKTOR', 'BOSS', 'BUGALTERIYA', 'PTO'],
    '/settings': ['DIREKTOR', 'BOSS'],
  };

  // Check if route has restrictions
  const allowedRoles = Object.entries(routeRoles).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];

  // If no restrictions, allow access
  if (!allowedRoles) return true;

  return hasRole(userRole, allowedRoles);
}

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  redirectTo = '/'
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const hasAccess = hasRole(user?.role, allowedRoles);

  useEffect(() => {
    if (!isLoading && !hasAccess && redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [isLoading, hasAccess, redirectTo, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{children}</>;
}

// Hook to check role access
export function useRoleAccess(allowedRoles: string[]): boolean {
  const { user } = useAuth();
  return hasRole(user?.role, allowedRoles);
}

// Component to conditionally render based on role
interface RoleVisibleProps {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}

export function RoleVisible({ children, roles, fallback = null }: RoleVisibleProps) {
  const hasAccess = useRoleAccess(roles);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
