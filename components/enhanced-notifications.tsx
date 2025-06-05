"use client"

import * as React from "react"
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, XCircle, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactElement
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  duration?: number
  onOpenChange?: (open: boolean) => void
}

const iconMap = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
}

const colorMap = {
  default: "bg-background text-foreground border-border",
  destructive: "bg-destructive text-destructive-foreground border-destructive/20",
  success: "bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800",
  warning: "bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800",
  info: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800",
}

function EnhancedToast({
  id,
  title,
  description,
  action,
  variant = "default",
  duration,
  onOpenChange,
}: EnhancedToastProps) {
  const Icon = iconMap[variant]
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onOpenChange?.(false)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onOpenChange])

  if (!isVisible) return null

  return (
    <Toast
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
        colorMap[variant]
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="grid gap-1">
          {title && (
            <div className="text-sm font-semibold">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
      </div>
      {action}
    </Toast>
  )
}

export function EnhancedToaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <EnhancedToast
            key={id}
            id={id}
            title={title}
            description={description}
            action={action}
            {...props}
          />
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

// Enhanced notification functions
export function useEnhancedNotifications() {
  const { toast } = useToast()

  const success = React.useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "success" as any,
      duration: 4000,
    })
  }, [toast])

  const error = React.useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
      duration: 6000,
    })
  }, [toast])

  const warning = React.useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "warning" as any,
      duration: 5000,
    })
  }, [toast])

  const info = React.useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "info" as any,
      duration: 4000,
    })
  }, [toast])

  const loading = React.useCallback((title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "default",
      duration: 0, // Don't auto-dismiss loading toasts
      action: <Loader2 className="h-4 w-4 animate-spin" />,
    })
  }, [toast])

  const promise = React.useCallback(
    <T,>(
      promise: Promise<T>,
      {
        loading: loadingMsg,
        success: successMsg,
        error: errorMsg,
      }: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: any) => string)
      }
    ) => {
      const toastId = loading(loadingMsg)

      promise
        .then((data) => {
          toastId.dismiss()
          const message = typeof successMsg === "function" ? successMsg(data) : successMsg
          success("Success", message)
        })
        .catch((err) => {
          toastId.dismiss()
          const message = typeof errorMsg === "function" ? errorMsg(err) : errorMsg
          error("Error", message)
        })

      return promise
    },
    [loading, success, error]
  )

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
    toast, // Original toast function for custom usage
  }
}