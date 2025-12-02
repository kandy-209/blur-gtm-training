import { User } from '@supabase/supabase-js';
import { GuestUser } from '@/hooks/useAuth';

export type AuthUser = User | GuestUser;

export type Permission = 
  | 'features:read'
  | 'features:chat'
  | 'scenarios:read'
  | 'scenarios:create'
  | 'scenarios:edit'
  | 'scenarios:delete'
  | 'analytics:read'
  | 'analytics:delete'
  | 'live:participate'
  | 'live:create'
  | 'admin:access'
  | 'leaderboard:view'
  | 'chat:general'
  | 'chat:technical'
  | 'chat:roi'
  | 'chat:features';

export type Role = 'guest' | 'user' | 'admin' | 'manager';

interface PermissionConfig {
  role: Role;
  permissions: Permission[];
}

// Role-based permission mapping
const rolePermissions: PermissionConfig[] = [
  {
    role: 'guest',
    permissions: [
      'features:read',
      'features:chat',
      'scenarios:read',
      'chat:general',
      'chat:features',
    ],
  },
  {
    role: 'user',
    permissions: [
      'features:read',
      'features:chat',
      'scenarios:read',
      'analytics:read',
      'analytics:delete',
      'live:participate',
      'leaderboard:view',
      'chat:general',
      'chat:technical',
      'chat:roi',
      'chat:features',
    ],
  },
  {
    role: 'manager',
    permissions: [
      'features:read',
      'features:chat',
      'scenarios:read',
      'scenarios:create',
      'scenarios:edit',
      'analytics:read',
      'analytics:delete',
      'live:participate',
      'live:create',
      'leaderboard:view',
      'chat:general',
      'chat:technical',
      'chat:roi',
      'chat:features',
    ],
  },
  {
    role: 'admin',
    permissions: [
      'features:read',
      'features:chat',
      'scenarios:read',
      'scenarios:create',
      'scenarios:edit',
      'scenarios:delete',
      'analytics:read',
      'analytics:delete',
      'live:participate',
      'live:create',
      'admin:access',
      'leaderboard:view',
      'chat:general',
      'chat:technical',
      'chat:roi',
      'chat:features',
    ],
  },
];

export function getUserRole(user: AuthUser | null): Role {
  if (!user) return 'guest';
  
  if ('isGuest' in user) {
    return 'guest';
  }

  // Check user metadata for role
  const userRole = (user as User).user_metadata?.role;
  if (userRole && ['user', 'admin', 'manager'].includes(userRole)) {
    return userRole as Role;
  }

  // Default to user for authenticated users
  return 'user';
}

export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  const role = getUserRole(user);
  const config = rolePermissions.find(c => c.role === role);
  
  if (!config) {
    return false;
  }

  return config.permissions.includes(permission);
}

export function getPermissions(user: AuthUser | null): Permission[] {
  const role = getUserRole(user);
  const config = rolePermissions.find(c => c.role === role);
  
  return config?.permissions || [];
}

export function canAccessChat(user: AuthUser | null, chatType: 'general' | 'technical' | 'roi' | 'features'): boolean {
  const permissionMap: Record<string, Permission> = {
    general: 'chat:general',
    technical: 'chat:technical',
    roi: 'chat:roi',
    features: 'chat:features',
  };

  return hasPermission(user, permissionMap[chatType]);
}

// Re-export OSO-style functions for compatibility
export { isAllowed, filterAuthorized, buildAuthzContext, canAccessChatType } from './oso-auth';
export type { AuthorizedResource, AuthorizationFilter } from './oso-auth';

