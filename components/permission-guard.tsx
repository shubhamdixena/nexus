"use client"

import React from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { Permission, UserRole } from '@/types/permissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ClientOnly } from '@/components/client-only'
import { ShieldX } from 'lucide-react'

interface PermissionGuardProps {
  children: React.ReactNode
  permission?: Permission
  role?: UserRole
  fallback?: React.ReactNode
  showError?: boolean
}

function PermissionGuardContent({ 
  children, 
  permission, 
  role, 
  fallback = null,
  showError = false
}: PermissionGuardProps) {
  const { userRole, hasPermission: checkPermission, loading } = usePermissions()

  // Show loading state
  if (loading) {
    return fallback || <div className="animate-pulse bg-muted h-8 w-full rounded" />
  }

  // Check permission-based access
  if (permission && !checkPermission(permission)) {
    if (showError) {
      return (
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this feature.
          </AlertDescription>
        </Alert>
      )
    }
    return <>{fallback}</>
  }

  // Check role-based access
  if (role && userRole !== role) {
    if (showError) {
      return (
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            This feature requires {role} role access.
          </AlertDescription>
        </Alert>
      )
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}

export function PermissionGuard(props: PermissionGuardProps) {
  return (
    <ClientOnly fallback={props.fallback || <div className="animate-pulse bg-muted h-8 w-full rounded" />}>
      <PermissionGuardContent {...props} />
    </ClientOnly>
  )
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback, showError }: Omit<PermissionGuardProps, 'role'>) {
  return (
    <PermissionGuard role="admin" fallback={fallback} showError={showError}>
      {children}
    </PermissionGuard>
  )
}

export function RequirePermission({ 
  children, 
  permission, 
  fallback, 
  showError 
}: Omit<PermissionGuardProps, 'role'> & { permission: Permission }) {
  return (
    <PermissionGuard permission={permission} fallback={fallback} showError={showError}>
      {children}
    </PermissionGuard>
  )
}