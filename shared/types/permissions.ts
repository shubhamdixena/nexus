// Role-based authentication and permissions system
export type UserRole = 'admin' | 'user' | 'student'

export type Permission = 
  // User management permissions
  | 'users:read' | 'users:write' | 'users:delete'
  // School management permissions
  | 'schools:read' | 'schools:write' | 'schools:delete'
  // Application management permissions
  | 'applications:read' | 'applications:write' | 'applications:delete'
  // Admin panel access
  | 'admin:access'
  // Scholarship management
  | 'scholarships:read' | 'scholarships:write' | 'scholarships:delete'
  // SOP management
  | 'sops:read' | 'sops:write' | 'sops:delete'
  // Admin granular permissions
  | 'admin.read' | 'admin.write'
  | 'admin.users.manage' | 'admin.users.advanced'
  | 'admin.schools.manage' | 'admin.scholarships.manage'
  | 'admin.sop.manage'
  | 'admin.data.manage' | 'admin.settings.manage'
  | 'admin.analytics.view'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
    'users:read', 'users:write', 'users:delete',
    'schools:read', 'schools:write', 'schools:delete',
    'applications:read', 'applications:write', 'applications:delete',
    'scholarships:read', 'scholarships:write', 'scholarships:delete',
    'sops:read', 'sops:write', 'sops:delete',
    'admin:access',
    // Admin granular permissions
    'admin.read', 'admin.write',
    'admin.users.manage', 'admin.users.advanced',
    'admin.schools.manage', 'admin.scholarships.manage',
    'admin.sop.manage',
    'admin.data.manage', 'admin.settings.manage',
    'admin.analytics.view'
  ],
  user: [
    // Read access to public data, manage own applications
    'schools:read',
    'scholarships:read',
    'sops:read',
    'applications:read', 'applications:write'
  ],
  student: [
    // Similar to user but may have different restrictions later
    'schools:read',
    'scholarships:read', 
    'sops:read',
    'applications:read', 'applications:write'
  ]
}

// Helper function to check if a role has a specific permission
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

// Helper function to check if a role can access admin features
export function canAccessAdmin(userRole: UserRole): boolean {
  return hasPermission(userRole, 'admin:access')
}

// Route protection configuration
export const PROTECTED_ROUTES = {
  admin: ['/admin'],
  user: ['/profile', '/applications', '/documents'],
  public: ['/', '/landing', '/universities', '/mba-schools', '/scholarships']
} as const

export type ProtectedRouteType = keyof typeof PROTECTED_ROUTES