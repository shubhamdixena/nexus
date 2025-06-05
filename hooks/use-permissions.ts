"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { UserRole, Permission, hasPermission, canAccessAdmin } from '@/types/permissions'

interface UsePermissionsReturn {
  userRole: UserRole
  loading: boolean
  hasPermission: (permission: Permission) => boolean
  canAccessAdmin: () => boolean
  isAdmin: boolean
  isUser: boolean
  isStudent: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const { user, loading } = useAuth()
  const [userRole, setUserRole] = useState<UserRole>('user')

  useEffect(() => {
    if (loading) {
      return
    }
    
    if (!user) {
      setUserRole('user')
      return
    }

    // Get role from Supabase user metadata
    const role = user.user_metadata?.role || user.app_metadata?.role || 'user'
    setUserRole(role as UserRole)
  }, [user, loading])

  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(userRole, permission)
  }

  const checkAdminAccess = (): boolean => {
    return canAccessAdmin(userRole)
  }

  return {
    userRole,
    loading,
    hasPermission: checkPermission,
    canAccessAdmin: checkAdminAccess,
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user',
    isStudent: userRole === 'student'
  }
}