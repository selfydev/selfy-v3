import type { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Role hierarchy for permission checking
 * Higher values have more permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  CUSTOMER: 1,
  CORPORATE_MEMBER: 2,
  CORPORATE_ADMIN: 3,
  STAFF: 4,
  ADMIN: 5,
};

/**
 * Check if a user has the required role or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Server-side guard: Require specific role or redirect
 * Use in Server Components or Server Actions
 */
export async function requireRole(requiredRole: UserRole, redirectTo: string = '/dashboard') {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (!hasRole(session.user.role, requiredRole)) {
    redirect(`${redirectTo}?error=insufficient_permissions&required=${requiredRole}`);
  }

  return session.user;
}

/**
 * Server-side guard: Require any of the specified roles or redirect
 * Use in Server Components or Server Actions
 */
export async function requireAnyRole(allowedRoles: UserRole[], redirectTo: string = '/dashboard') {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (!hasAnyRole(session.user.role, allowedRoles)) {
    redirect(`${redirectTo}?error=insufficient_permissions&required=${allowedRoles.join(',')}`);
  }

  return session.user;
}

/**
 * Server-side guard: Get current user with role or redirect if not authenticated
 * Use in Server Components
 */
export async function getCurrentUserWithRole() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return session.user;
}

/**
 * Client-side utility: Check if user session has required role
 * Use with useSession() hook in Client Components
 */
export function canAccess(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return hasRole(userRole, requiredRole);
}

/**
 * Client-side utility: Check if user has any of the allowed roles
 * Use with useSession() hook in Client Components
 */
export function canAccessAny(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return hasAnyRole(userRole, allowedRoles);
}
