"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  icon?: LucideIcon
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon: Icon,
  onConfirm,
  loading = false,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Let the parent component handle errors
      console.error("Confirmation action failed:", error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {loading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook for easy confirmation dialogs
export function useConfirmation() {
  const [state, setState] = React.useState<{
    open: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
    icon?: LucideIcon
    onConfirm?: () => void | Promise<void>
    loading?: boolean
  }>({
    open: false,
    title: "",
    description: "",
  })

  const confirm = React.useCallback(
    (options: Omit<ConfirmationDialogProps, "open" | "onOpenChange">) => {
      return new Promise<boolean>((resolve) => {
        setState({
          ...options,
          open: true,
          onConfirm: async () => {
            if (options.onConfirm) {
              await options.onConfirm()
            }
            resolve(true)
          },
        })
      })
    },
    []
  )

  const dialog = (
    <ConfirmationDialog
      {...state}
      onOpenChange={(open) => setState((prev) => ({ ...prev, open }))}
    />
  )

  return { confirm, dialog }
}