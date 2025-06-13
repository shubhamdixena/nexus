"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface CompareItem {
  id: string
  name: string
  type: string
  location: string
  country: string
  ranking: number
  [key: string]: any
}

interface UseCompareReturn {
  compareItems: CompareItem[]
  addToCompare: (item: CompareItem) => void
  removeFromCompare: (itemId: string) => void
  clearCompare: () => void
  isInCompare: (itemId: string) => boolean
  compareCount: number
  maxCompareItems: number
  canAddMore: boolean
}

const MAX_COMPARE_ITEMS = 4
const STORAGE_KEY = "mba-schools-compare"

export function useCompare(): UseCompareReturn {
  const [compareItems, setCompareItems] = useState<CompareItem[]>([])
  const { toast } = useToast()

  // Load compare items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setCompareItems(parsed)
        }
      }
    } catch (error) {
      console.error("Error loading compare items from localStorage:", error)
    }
  }, [])

  // Save to localStorage whenever compareItems changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems))
    } catch (error) {
      console.error("Error saving compare items to localStorage:", error)
    }
  }, [compareItems])

  const addToCompare = useCallback((item: CompareItem) => {
    setCompareItems(current => {
      // Check if already in compare
      if (current.some(compareItem => compareItem.id === item.id)) {
        // Use setTimeout to defer toast and avoid render-time state update
        setTimeout(() => {
          toast({
            title: "Already in comparison",
            description: `${item.name} is already in your comparison list.`,
            variant: "default",
          })
        }, 0)
        return current
      }

      // Check if we've reached the maximum
      if (current.length >= MAX_COMPARE_ITEMS) {
        // Use setTimeout to defer toast and avoid render-time state update
        setTimeout(() => {
          toast({
            title: "Comparison limit reached",
            description: `You can compare up to ${MAX_COMPARE_ITEMS} schools at once. Remove a school to add a new one.`,
            variant: "destructive",
          })
        }, 0)
        return current
      }

      // Add to compare
      const updated = [...current, item]
      // Use setTimeout to defer toast and avoid render-time state update
      setTimeout(() => {
        toast({
          title: "Added to comparison",
          description: `${item.name} has been added to your comparison list.`,
          variant: "default",
        })
      }, 0)
      
      return updated
    })
  }, [toast])

  const removeFromCompare = useCallback((itemId: string) => {
    setCompareItems(current => {
      const item = current.find(item => item.id === itemId)
      const updated = current.filter(item => item.id !== itemId)
      
      if (item) {
        // Use setTimeout to defer toast and avoid render-time state update
        setTimeout(() => {
          toast({
            title: "Removed from comparison",
            description: `${item.name} has been removed from your comparison list.`,
            variant: "default",
          })
        }, 0)
      }
      
      return updated
    })
  }, [toast])

  const clearCompare = useCallback(() => {
    setCompareItems([])
    // Use setTimeout to defer toast and avoid render-time state update
    setTimeout(() => {
      toast({
        title: "Comparison cleared",
        description: "All schools have been removed from your comparison list.",
        variant: "default",
      })
    }, 0)
  }, [toast])

  const isInCompare = useCallback((itemId: string) => {
    return compareItems.some(item => item.id === itemId)
  }, [compareItems])

  return {
    compareItems,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    compareCount: compareItems.length,
    maxCompareItems: MAX_COMPARE_ITEMS,
    canAddMore: compareItems.length < MAX_COMPARE_ITEMS,
  }
}