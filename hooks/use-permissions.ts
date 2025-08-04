"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { UserRole, Permission, hasPermission, canAccessAdmin } from '@/types/permissions'
import { createClient } from '@/lib/supabaseClient'

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
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (loading) {
        return
      }
      
      if (!user) {
        setUserRole('user')
        setRoleLoading(false)
        return
      }

      try {
        const supabase = createClient()
        
        // First check the database for the user's role
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!error && userData?.role) {
          setUserRole(userData.role as UserRole)
        } else {
          // Fallback to user metadata if database lookup fails
          const role = user.user_metadata?.role || user.app_metadata?.role || 'user'
          setUserRole(role as UserRole)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
        // Fallback to user metadata
        const role = user.user_metadata?.role || user.app_metadata?.role || 'user'
        setUserRole(role as UserRole)
      } finally {
        setRoleLoading(false)
      }
    }

    fetchUserRole()
  }, [user, loading])

  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(userRole, permission)
  }

  const checkAdminAccess = (): boolean => {
    return canAccessAdmin(userRole)
  }

  return {
    userRole,
    loading: loading || roleLoading,
    hasPermission: checkPermission,
    canAccessAdmin: checkAdminAccess,
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user',
    isStudent: userRole === 'student'
  }
}