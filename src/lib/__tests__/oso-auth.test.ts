import { isAllowed, filterAuthorized, canAccessChatType, buildAuthzContext, UserContext } from '../oso-auth';
import { AuthorizedResource } from '../oso-auth';
import { GuestUser } from '@/hooks/useAuth';

// Mock the permissions module
jest.mock('../permissions', () => ({
  getUserRole: jest.fn((user: any) => {
    if (!user) return 'guest';
    if (user.isGuest) return 'guest';
    return user.role || 'user';
  }),
}));

describe('OSO Authorization System', () => {
  describe('isAllowed', () => {
    it('should allow guests to access general chat', () => {
      const guestUser: GuestUser = {
        id: 'guest_123',
        email: 'guest@test.com',
        username: 'Guest',
        roleAtCursor: 'Sales Rep',
        isGuest: true,
      };
      
      expect(isAllowed(guestUser, 'chat:general')).toBe(true);
      expect(isAllowed(guestUser, 'features:read')).toBe(true);
    });

    it('should deny guests access to technical chat', () => {
      const guestUser: GuestUser = {
        id: 'guest_123',
        email: 'guest@test.com',
        username: 'Guest',
        roleAtCursor: 'Sales Rep',
        isGuest: true,
      };
      
      expect(isAllowed(guestUser, 'chat:technical')).toBe(false);
      expect(isAllowed(guestUser, 'chat:roi')).toBe(false);
    });

    it('should allow authenticated users to access technical chat', () => {
      const userContext: UserContext = {
        id: 'user_123',
        role: 'user',
        isGuest: false,
      };
      
      expect(isAllowed(userContext, 'chat:technical')).toBe(true);
      expect(isAllowed(userContext, 'chat:roi')).toBe(true);
    });

    it('should allow admins to access all permissions', () => {
      const adminContext: UserContext = {
        id: 'admin_123',
        role: 'admin',
        isGuest: false,
      };
      
      expect(isAllowed(adminContext, 'admin:access')).toBe(true);
      expect(isAllowed(adminContext, 'scenarios:delete')).toBe(true);
      expect(isAllowed(adminContext, 'chat:technical')).toBe(true);
    });

    it('should deny null users access to restricted features', () => {
      expect(isAllowed(null, 'chat:technical')).toBe(false);
      expect(isAllowed(null, 'admin:access')).toBe(false);
    });

    it('should check resource-specific permissions', () => {
      const resource: AuthorizedResource = {
        id: 'resource_1',
        type: 'feature',
        permissions: ['features:read', 'features:chat'],
      };
      
      const userContext: UserContext = {
        id: 'user_123',
        role: 'user',
        isGuest: false,
      };
      
      expect(isAllowed(userContext, 'features:read', resource)).toBe(true);
      expect(isAllowed(userContext, 'features:chat', resource)).toBe(true);
      expect(isAllowed(userContext, 'scenarios:delete', resource)).toBe(false);
    });
  });

  describe('filterAuthorized', () => {
    it('should filter resources based on user permissions', () => {
      const resources: AuthorizedResource[] = [
        {
          id: 'r1',
          type: 'feature',
          permissions: ['features:read'],
          metadata: { requiresAuth: false },
        },
        {
          id: 'r2',
          type: 'feature',
          permissions: ['features:read'],
          metadata: { requiresAuth: true },
        },
        {
          id: 'r3',
          type: 'feature',
          permissions: ['chat:technical'],
          metadata: { requiresAuth: true, roleRequired: ['user', 'admin'] },
        },
      ];

      const guestContext: UserContext = {
        id: 'guest_123',
        role: 'guest',
        isGuest: true,
      };

      const filtered = filterAuthorized(guestContext, resources, 'features:read');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('r1');
    });

    it('should allow authenticated users to access auth-required resources', () => {
      const resources: AuthorizedResource[] = [
        {
          id: 'r1',
          type: 'feature',
          permissions: ['chat:technical'] as any[],
          metadata: { requiresAuth: true },
        },
      ];

      const userContext: UserContext = {
        id: 'user_123',
        role: 'user',
        isGuest: false,
      };

      // Verify user can perform the action (without resource)
      expect(isAllowed(userContext, 'chat:technical')).toBe(true);
      
      // Verify user can access the resource (with resource permissions)
      // When resource has permissions, isAllowed checks:
      // 1. Action is in resource permissions ✓
      // 2. User has role-based access ✓
      const canAccessResource = isAllowed(userContext, 'chat:technical', resources[0]);
      expect(canAccessResource).toBe(true);
      
      // Filter resources - should pass all checks:
      // 1. Resource permissions include 'chat:technical' ✓
      // 2. User can perform 'chat:technical' (role-based check) ✓
      // 3. User is authenticated (not guest), so requiresAuth check passes ✓
      const filtered = filterAuthorized(userContext, resources, 'chat:technical');
      
      // Verify individual checks
      expect(resources[0].permissions.includes('chat:technical')).toBe(true);
      expect(isAllowed(userContext, 'chat:technical')).toBe(true);
      expect(isAllowed(userContext, 'chat:technical', resources[0])).toBe(true);
      expect(userContext.isGuest).toBe(false);
      expect(resources[0].metadata?.requiresAuth).toBe(true);
      
      // The resource should pass all filters:
      // 1. Resource permissions include action ✓
      // 2. isAllowed returns true ✓
      // 3. User is authenticated (not guest) ✓
      // 4. requiresAuth check passes ✓
      
      // Verify the resource passes all checks
      expect(resources[0].permissions.includes('chat:technical')).toBe(true);
      expect(isAllowed(userContext, 'chat:technical', resources[0])).toBe(true);
      expect(userContext.isGuest).toBe(false);
      
      // The filtered result should include r1
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('r1');
    });

    it('should filter by role requirements', () => {
      // Note: When a resource has permissions, isAllowed checks if action is in resource permissions
      // AND if user has role-based access. The roleRequired metadata is checked separately in filterAuthorized.
      const resources: AuthorizedResource[] = [
        {
          id: 'r1',
          type: 'feature',
          permissions: ['admin:access'] as any[],
          metadata: { roleRequired: ['admin'] },
        },
        {
          id: 'r2',
          type: 'feature',
          permissions: ['scenarios:create'] as any[],
          metadata: { roleRequired: ['manager', 'admin'] },
        },
      ];

      const managerContext: UserContext = {
        id: 'manager_123',
        role: 'manager',
        isGuest: false,
      };

      // Verify manager can perform scenarios:create (role-based)
      expect(isAllowed(managerContext, 'scenarios:create')).toBe(true);
      
      // When resource has permissions, isAllowed checks both resource permissions and role-based access
      // Resource r2 has 'scenarios:create' permission, and manager has role-based access
      expect(isAllowed(managerContext, 'scenarios:create', resources[1])).toBe(true);
      
      // Verify individual checks
      expect(resources[1].permissions.includes('scenarios:create')).toBe(true);
      expect(managerContext.role).toBe('manager');
      expect(resources[1].metadata?.roleRequired).toContain('manager');
      
      // Verify manager can access r2 resource directly
      expect(isAllowed(managerContext, 'scenarios:create', resources[1])).toBe(true);
      
      // filterAuthorized will check:
      // 1. Resource permissions include action ✓
      // 2. isAllowed (resource permissions + role-based access) ✓
      // 3. roleRequired metadata - manager is in ['manager', 'admin'] ✓
      const filtered = filterAuthorized(managerContext, resources, 'scenarios:create');
      
      // Manager should be able to access r2
      // Note: r1 requires admin role, so it should be filtered out
      expect(filtered.length).toBeGreaterThanOrEqual(1);
      // Check that r2 is in the filtered results
      const r2InFiltered = filtered.some(r => r.id === 'r2');
      expect(r2InFiltered).toBe(true);
    });
  });

  describe('canAccessChatType', () => {
    it('should allow guests to access general and features chat', () => {
      const guestContext: UserContext = {
        id: 'guest_123',
        role: 'guest',
        isGuest: true,
      };

      expect(canAccessChatType(guestContext, 'general')).toBe(true);
      expect(canAccessChatType(guestContext, 'features')).toBe(true);
      expect(canAccessChatType(guestContext, 'technical')).toBe(false);
      expect(canAccessChatType(guestContext, 'roi')).toBe(false);
    });

    it('should allow authenticated users to access all chat types', () => {
      const userContext: UserContext = {
        id: 'user_123',
        role: 'user',
        isGuest: false,
      };

      expect(canAccessChatType(userContext, 'general')).toBe(true);
      expect(canAccessChatType(userContext, 'features')).toBe(true);
      expect(canAccessChatType(userContext, 'technical')).toBe(true);
      expect(canAccessChatType(userContext, 'roi')).toBe(true);
    });
  });

  describe('buildAuthzContext', () => {
    it('should build context for guest users', () => {
      const guestUser: GuestUser = {
        id: 'guest_123',
        email: 'guest@test.com',
        username: 'Guest',
        roleAtCursor: 'Sales Rep',
        isGuest: true,
      };

      const context = buildAuthzContext(guestUser as any);
      expect(context.role).toBe('guest');
      expect(context.isGuest).toBe(true);
      expect(context.permissions).toContain('chat:general');
      expect(context.permissions).not.toContain('chat:technical');
    });

    it('should build context for authenticated users', () => {
      // buildAuthzContext expects AuthUser, not UserContext
      const mockUser = {
        id: 'user_123',
        user_metadata: { role: 'user' },
      };

      const context = buildAuthzContext(mockUser as any);
      expect(context.role).toBe('user');
      expect(context.isGuest).toBe(false);
      expect(context.permissions).toContain('chat:technical');
      expect(context.permissions).toContain('chat:roi');
    });

    it('should handle null user', () => {
      const context = buildAuthzContext(null);
      expect(context.role).toBe('guest');
      expect(context.isGuest).toBe(true);
      expect(context.userId).toBe('anonymous');
    });
  });
});

