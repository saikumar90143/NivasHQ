import { ForbiddenError } from './errors';

export const PERMISSIONS = {
  // Properties
  'properties.create': ['AGENT', 'BUILDER', 'ADMIN'],
  'properties.update_own': ['AGENT', 'BUILDER', 'ADMIN'],
  'properties.update_any': ['ADMIN'],
  'properties.delete_own': ['AGENT', 'BUILDER', 'ADMIN'],
  'properties.delete_any': ['ADMIN'],
  'properties.approve': ['ADMIN'],
  'properties.feature': ['ADMIN'],
  'properties.verify': ['ADMIN'],
  // Leads
  'leads.create': ['BUYER', 'AGENT', 'BUILDER', 'ADMIN'],
  'leads.read_own': ['AGENT', 'ADMIN'],
  'leads.update_own': ['AGENT', 'ADMIN'],
  'leads.manage': ['ADMIN'],
  // Agents
  'agents.verify': ['ADMIN'],
  'agents.suspend': ['ADMIN'],
  // Users
  'users.manage': ['ADMIN'],
  // Subscriptions
  'subscriptions.manage': ['ADMIN'],
  'subscriptions.create_own': ['AGENT'],
  // Admin
  'admin.access': ['ADMIN'],
  'admin.reports': ['ADMIN'],
} as const satisfies Record<string, string[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(userRole: string, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(userRole);
}

export function requirePermission(userRole: string, permission: Permission): void {
  if (!hasPermission(userRole, permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

export function getUserPermissions(userRole: string): Permission[] {
  const permissions: Permission[] = [];
  for (const [perm, roles] of Object.entries(PERMISSIONS) as [string, readonly string[]][]) {
    if (roles.includes(userRole)) {
      permissions.push(perm as Permission);
    }
  }
  return permissions;
}
