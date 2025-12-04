/**
 * OSO-style authorization system
 * Inspired by https://github.com/osohq/oso-rag-chatbot
 * 
 * This implements permission-based filtering similar to OSO Cloud
 * for controlling what data and responses users can access.
 */

import { AuthUser } from './permissions';
import { Permission } from './permissions';

export interface AuthorizedResource {
  id: string;
  type: string;
  permissions: Permission[];
  metadata?: Record<string, any>;
}

export interface AuthorizationFilter {
  resourceType: string;
  action: Permission;
  userId: string;
  role: string;
}

/**
 * Simplified user context for OSO-style authorization
 */
export interface UserContext {
  id: string;
  role: string;
  isGuest: boolean;
}

/**
 * Check if user can perform action on resource
 * Similar to OSO's `isAllowed` check
 */
export function isAllowed(
  user: AuthUser | UserContext | null,
  action: Permission,
  resource?: AuthorizedResource
): boolean {
  // Normalize user to UserContext
  let userContext: UserContext | null = null;
  
  if (!user) {
    userContext = { id: 'anonymous', role: 'guest', isGuest: true };
  } else if ((user as any).role !== undefined && typeof (user as any).isGuest === 'boolean') {
    // Already a UserContext
    userContext = {
      id: (user as any).id || 'anonymous',
      role: (user as any).role,
      isGuest: (user as any).isGuest,
    };
  } else if ('isGuest' in user || (user as any).isGuest !== undefined) {
    // GuestUser type
    const isGuest = 'isGuest' in user ? user.isGuest : (user as any).isGuest;
    userContext = {
      id: (user as any).id || 'anonymous',
      role: 'guest',
      isGuest: isGuest || false,
    };
  } else {
    // AuthUser (Supabase User) - check user_metadata for role
    const userRole = (user as any).user_metadata?.role || 'user';
    userContext = {
      id: (user as any).id || 'anonymous',
      role: userRole,
      isGuest: false,
    };
  }

  if (!userContext) {
    return false;
  }

  // Check if resource has specific permissions
  // If resource has permissions, check if action is allowed
  // Then continue to role-based checks to ensure user has access
  if (resource && resource.permissions) {
    if (!resource.permissions.includes(action)) {
      return false; // Resource doesn't grant this permission
    }
    // Action is in resource permissions, but still need to check role-based access
  }

  // Role-based checks
  if (userContext.isGuest || userContext.role === 'guest') {
    return ['features:read', 'features:chat', 'scenarios:read', 'chat:general', 'chat:features'].includes(action);
  }

  // Admin has all permissions
  if (userContext.role === 'admin') {
    return true;
  }

  // Manager permissions
  if (userContext.role === 'manager') {
    // Managers can do everything except delete scenarios and admin access
    return !['scenarios:delete', 'admin:access'].includes(action);
  }

  // User permissions - users can access most features but not create/edit scenarios
  if (userContext.role === 'user') {
    // Users can access chat, features, analytics, live sessions
    const allowedActions: Permission[] = [
      'chat:general', 'chat:technical', 'chat:roi', 'chat:features',
      'features:read', 'features:chat', 'scenarios:read',
      'analytics:read', 'analytics:delete', 'live:participate', 'leaderboard:view'
    ];
    
    if (allowedActions.includes(action)) {
      return true;
    }
    
    // Deny specific actions
    return !['scenarios:create', 'scenarios:edit', 'scenarios:delete', 'admin:access'].includes(action);
  }

  return false;
}

/**
 * Filter resources based on user permissions
 * Similar to OSO's authorization filter queries
 */
export function filterAuthorized<T extends AuthorizedResource>(
  user: AuthUser | UserContext | null,
  resources: T[],
  action: Permission
): T[] {
  // Normalize user to UserContext
  let userContext: UserContext | null = null;
  
  if (!user) {
    userContext = { id: 'anonymous', role: 'guest', isGuest: true };
  } else if ((user as any).role !== undefined && typeof (user as any).isGuest === 'boolean') {
    // Already a UserContext with all required fields - check this FIRST
    userContext = {
      id: (user as any).id || 'anonymous',
      role: (user as any).role,
      isGuest: (user as any).isGuest,
    };
  } else if ('isGuest' in user && (user as any).isGuest === true) {
    // GuestUser type - only treat as guest if isGuest is explicitly true
    userContext = {
      id: (user as any).id || 'anonymous',
      role: 'guest',
      isGuest: true,
    };
  } else {
    // AuthUser (Supabase User) - check user_metadata for role
    const userRole = (user as any).user_metadata?.role || 'user';
    userContext = {
      id: (user as any).id || 'anonymous',
      role: userRole,
      isGuest: false,
    };
  }

  return resources.filter(resource => {
    // First check if resource grants the permission
    if (resource.permissions && resource.permissions.length > 0) {
      if (!resource.permissions.includes(action)) {
        return false; // Resource doesn't grant this permission
      }
    }
    
    // Check if user can perform action (role-based check)
    if (!isAllowed(userContext, action, resource)) {
      return false;
    }

    // Additional resource-specific checks
    if (resource.metadata?.requiresAuth && (!userContext || userContext.isGuest)) {
      return false;
    }

    if (resource.metadata?.roleRequired && userContext) {
      if (!resource.metadata.roleRequired.includes(userContext.role)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Build authorization context for API requests
 * Similar to OSO's authorization context
 */
export function buildAuthzContext(user: AuthUser | UserContext | null): {
  userId: string;
  role: string;
  permissions: Permission[];
  isGuest: boolean;
} {
  if (!user) {
    return {
      userId: 'anonymous',
      role: 'guest',
      permissions: ['features:read', 'features:chat', 'scenarios:read', 'chat:general', 'chat:features'],
      isGuest: true,
    };
  }

  // Handle UserContext
  if ((user as any).role !== undefined && typeof (user as any).isGuest === 'boolean') {
    const userContext = user as UserContext;
    return {
      userId: userContext.id,
      role: userContext.role,
      permissions: getPermissionsForRole(userContext.role),
      isGuest: userContext.isGuest,
    };
  }

  // Handle GuestUser
  if ('isGuest' in user && user.isGuest) {
    return {
      userId: user.id,
      role: 'guest',
      permissions: ['features:read', 'features:chat', 'scenarios:read', 'chat:general', 'chat:features'],
      isGuest: true,
    };
  }

  // Handle AuthUser (Supabase User)
  const userRole = (user as any).user_metadata?.role || 'user';
  const permissions = getPermissionsForRole(userRole);

  return {
    userId: user.id,
    role: userRole,
    permissions,
    isGuest: false,
  };
}

export function getPermissionsForRole(role: string): Permission[] {
  const rolePermissions: Record<string, Permission[]> = {
    guest: ['features:read', 'features:chat', 'scenarios:read', 'chat:general', 'chat:features'],
    user: [
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
    manager: [
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
    admin: [
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
  };

  return rolePermissions[role] || rolePermissions.user;
}

/**
 * Check if user can access chat type
 */
export function canAccessChatType(
  user: AuthUser | UserContext | null,
  chatType: 'general' | 'technical' | 'roi' | 'features'
): boolean {
  const permissionMap: Record<string, Permission> = {
    general: 'chat:general',
    technical: 'chat:technical',
    roi: 'chat:roi',
    features: 'chat:features',
  };

  return isAllowed(user, permissionMap[chatType]);
}

