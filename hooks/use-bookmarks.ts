import { useState, useEffect, useCallback, useRef } from 'react'
import { bookmarkService, type BookmarkType } from '@/lib/bookmark-service'
import { useToast } from '@/hooks/use-toast'

export function useBookmarks(itemType: BookmarkType) {
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const subscriptionRef = useRef<any>(null)
  const mountedRef = useRef(true)

  // Load user's bookmarked items
  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const itemIds = await bookmarkService.getBookmarkedItemIds(itemType)
      if (mountedRef.current) {
        setBookmarkedItems(new Set(itemIds))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookmarks'
      if (mountedRef.current) {
        setError(errorMessage)
      }
      console.error('Error loading bookmarks:', err)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [itemType])

  // Toggle bookmark for a specific item
  const toggleBookmark = useCallback(async (itemId: string) => {
    try {
      const wasBookmarked = bookmarkedItems.has(itemId)
      const isNowBookmarked = await bookmarkService.toggleBookmark(itemType, itemId)
      
      if (mountedRef.current) {
        setBookmarkedItems(prev => {
          const newSet = new Set(prev)
          if (isNowBookmarked) {
            newSet.add(itemId)
          } else {
            newSet.delete(itemId)
          }
          return newSet
        })

        // Show success toast
        toast({
          title: isNowBookmarked ? 'Bookmark Added' : 'Bookmark Removed',
          description: isNowBookmarked 
            ? 'Item has been added to your bookmarks' 
            : 'Item has been removed from your bookmarks',
        })
      }

      return isNowBookmarked
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bookmark'
      if (mountedRef.current) {
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
      console.error('Error toggling bookmark:', err)
      return bookmarkedItems.has(itemId) // Return current state on error
    }
  }, [itemType, bookmarkedItems, toast])

  // Check if an item is bookmarked
  const isBookmarked = useCallback((itemId: string) => {
    return bookmarkedItems.has(itemId)
  }, [bookmarkedItems])

  // Get all bookmarked item IDs as array
  const getBookmarkedItemIds = useCallback(() => {
    return Array.from(bookmarkedItems)
  }, [bookmarkedItems])

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks()
  }, [loadBookmarks])

  // Subscribe to real-time updates
  useEffect(() => {
    // Cleanup any existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }

    // Only subscribe if component is mounted
    if (!mountedRef.current) return

    try {
      const subscription = bookmarkService.subscribeToUserBookmarks(
        async () => {
          // Only reload if component is still mounted
          if (mountedRef.current) {
            await loadBookmarks()
          }
        },
        itemType
      )

      subscriptionRef.current = subscription

      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe()
          subscriptionRef.current = null
        }
      }
    } catch (error) {
      console.error('Error setting up bookmark subscription:', error)
    }
  }, [itemType, loadBookmarks])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [])

  return {
    bookmarkedItems: Array.from(bookmarkedItems),
    isBookmarked,
    toggleBookmark,
    getBookmarkedItemIds,
    loading,
    error,
    refresh: loadBookmarks,
  }
}

// Hook for checking bookmark status of multiple items
export function useBookmarkStatus(itemType: BookmarkType, itemIds: string[]) {
  const [bookmarkStatus, setBookmarkStatus] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  const checkBookmarks = useCallback(async () => {
    if (itemIds.length === 0) {
      if (mountedRef.current) {
        setBookmarkStatus({})
        setLoading(false)
      }
      return
    }

    try {
      setLoading(true)
      const status = await bookmarkService.checkMultipleBookmarks(itemType, itemIds)
      if (mountedRef.current) {
        setBookmarkStatus(status)
      }
    } catch (err) {
      console.error('Error checking bookmark status:', err)
      if (mountedRef.current) {
        setBookmarkStatus({})
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [itemType, itemIds])

  useEffect(() => {
    checkBookmarks()
  }, [checkBookmarks])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    bookmarkStatus,
    loading,
    refresh: checkBookmarks,
  }
}