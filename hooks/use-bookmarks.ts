import { useState, useEffect, useCallback } from 'react'
import { bookmarkService, type BookmarkType } from '@/lib/bookmark-service'
import { useToast } from '@/hooks/use-toast'

export function useBookmarks(itemType: BookmarkType) {
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load user's bookmarked items
  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const itemIds = await bookmarkService.getBookmarkedItemIds(itemType)
      setBookmarkedItems(new Set(itemIds))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookmarks'
      setError(errorMessage)
      console.error('Error loading bookmarks:', err)
    } finally {
      setLoading(false)
    }
  }, [itemType])

  // Toggle bookmark for a specific item
  const toggleBookmark = useCallback(async (itemId: string) => {
    try {
      const wasBookmarked = bookmarkedItems.has(itemId)
      const isNowBookmarked = await bookmarkService.toggleBookmark(itemType, itemId)
      
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

      return isNowBookmarked
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bookmark'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
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
    const subscription = bookmarkService.subscribeToUserBookmarks(
      async () => {
        // Reload bookmarks when changes occur
        await loadBookmarks()
      },
      itemType
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [loadBookmarks, itemType])

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

  const checkBookmarks = useCallback(async () => {
    if (itemIds.length === 0) {
      setBookmarkStatus({})
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const status = await bookmarkService.checkMultipleBookmarks(itemType, itemIds)
      setBookmarkStatus(status)
    } catch (err) {
      console.error('Error checking bookmark status:', err)
      setBookmarkStatus({})
    } finally {
      setLoading(false)
    }
  }, [itemType, itemIds])

  useEffect(() => {
    checkBookmarks()
  }, [checkBookmarks])

  return {
    bookmarkStatus,
    loading,
    refresh: checkBookmarks,
  }
}