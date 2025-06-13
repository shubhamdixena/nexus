"use client"

import { useState } from "react"
import { Plus, Check, GitCompare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCompare } from "@/hooks/use-compare"

interface CompareButtonProps {
  school: {
    id: string
    name: string
    type: string
    location: string
    country: string
    ranking: number
    [key: string]: any
  }
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function CompareButton({ 
  school, 
  variant = "outline", 
  size = "sm",
  className = ""
}: CompareButtonProps) {
  const { 
    addToCompare, 
    removeFromCompare, 
    isInCompare, 
    canAddMore 
  } = useCompare()
  
  const [isAdding, setIsAdding] = useState(false)
  const inCompare = isInCompare(school.id)

  const handleToggleCompare = async () => {
    console.log('CompareButton clicked - school:', school.name, 'inCompare:', inCompare)
    
    if (inCompare) {
      console.log('Removing from compare')
      removeFromCompare(school.id)
    } else {
      if (!canAddMore) {
        console.log('Cannot add more - limit reached')
        return // This will be handled by the hook's toast
      }
      
      console.log('Adding to compare')
      setIsAdding(true)
      // Add a small delay for better UX
      setTimeout(() => {
        addToCompare(school)
        setIsAdding(false)
      }, 200)
    }
  }

  return (
    <Button
      variant={inCompare ? "default" : variant}
      size={size}
      onClick={handleToggleCompare}
      disabled={isAdding || (!canAddMore && !inCompare)}
      className={className}
    >
      {isAdding ? (
        <>
          <Plus className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : inCompare ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added
        </>
      ) : (
        <>
          <GitCompare className="mr-2 h-4 w-4" />
          Compare
        </>
      )}
    </Button>
  )
}

interface CompareCounterProps {
  className?: string
}

export function CompareCounter({ className = "" }: CompareCounterProps) {
  const { compareCount } = useCompare()

  if (compareCount === 0) return null

  return (
    <Link href="/mba-schools/compare">
      <Button variant="outline" size="sm" className={className}>
        <GitCompare className="mr-2 h-4 w-4" />
        Compare ({compareCount})
      </Button>
    </Link>
  )
}