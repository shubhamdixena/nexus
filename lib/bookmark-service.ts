import { createClient } from '@/lib/supabaseClient'

export type BookmarkType = 'university' | 'mba_school' | 'scholarship' | 'sop'

export interface Bookmark {
  id: string
  user_id: string
  item_type: BookmarkType
  item_id: string
  created_at: string
}

export interface BookmarkWithCount {
  id: string
  user_id: string
  item_type: BookmarkType
  item_id: string
  created_at: string
  bookmark_count: number
}

class BookmarkService {
  private supabase = createClient()

  /**
   * Add a bookmark for the current user
   */
  async addBookmark(itemType: BookmarkType, itemId: string): Promise<Bookmark> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('user_bookmarks')
      .insert({
        user_id: user.id,
        item_type: itemType,
        item_id: itemId
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add bookmark: ${error.message}`)
    }

    return data
  }

  /**
   * Remove a bookmark for the current user
   */
  async removeBookmark(itemType: BookmarkType, itemId: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await this.supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('item_type', itemType)
      .eq('item_id', itemId)

    if (error) {
      throw new Error(`Failed to remove bookmark: ${error.message}`)
    }
  }

  /**
   * Toggle bookmark status for an item
   */
  async toggleBookmark(itemType: BookmarkType, itemId: string): Promise<boolean> {
    const isBookmarked = await this.isBookmarked(itemType, itemId)
    
    if (isBookmarked) {
      await this.removeBookmark(itemType, itemId)
      return false
    } else {
      await this.addBookmark(itemType, itemId)
      return true
    }
  }

  /**
   * Check if an item is bookmarked by the current user
   */
  async isBookmarked(itemType: BookmarkType, itemId: string): Promise<boolean> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      return false
    }

    const { data, error } = await this.supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle()

    if (error) {
      console.error('Error checking bookmark status:', error)
      return false
    }

    return !!data
  }

  /**
   * Get all bookmarks for the current user by type
   */
  async getUserBookmarks(itemType?: BookmarkType): Promise<Bookmark[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      return []
    }

    let query = this.supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (itemType) {
      query = query.eq('item_type', itemType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching bookmarks:', error)
      return []
    }

    return data || []
  }

  /**
   * Get bookmarked item IDs for the current user by type
   */
  async getBookmarkedItemIds(itemType: BookmarkType): Promise<string[]> {
    const bookmarks = await this.getUserBookmarks(itemType)
    return bookmarks.map(bookmark => bookmark.item_id)
  }

  /**
   * Get bookmark counts for multiple items
   */
  async getBookmarkCounts(itemType: BookmarkType, itemIds: string[]): Promise<Record<string, number>> {
    if (itemIds.length === 0) {
      return {}
    }

    const { data, error } = await this.supabase
      .rpc('get_bookmark_counts', {
        item_type_param: itemType,
        item_ids_param: itemIds
      })

    if (error) {
      console.error('Error fetching bookmark counts:', error)
      return {}
    }

    const counts: Record<string, number> = {}
    data?.forEach((item: any) => {
      counts[item.item_id] = item.bookmark_count
    })

    return counts
  }

  /**
   * Subscribe to bookmark changes for real-time updates
   */
  subscribeToUserBookmarks(
    callback: (bookmarks: Bookmark[]) => void,
    itemType?: BookmarkType
  ) {
    return this.supabase
      .channel('user-bookmarks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_bookmarks',
          filter: itemType ? `item_type=eq.${itemType}` : undefined
        }, 
        async () => {
          // Refresh bookmarks when changes occur
          const bookmarks = await this.getUserBookmarks(itemType)
          callback(bookmarks)
        }
      )
      .subscribe()
  }

  /**
   * Check bookmark status for multiple items (bulk operation)
   */
  async checkMultipleBookmarks(itemType: BookmarkType, itemIds: string[]): Promise<Record<string, boolean>> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user || itemIds.length === 0) {
      return {}
    }

    const { data, error } = await this.supabase
      .from('user_bookmarks')
      .select('item_id')
      .eq('user_id', user.id)
      .eq('item_type', itemType)
      .in('item_id', itemIds)

    if (error) {
      console.error('Error checking multiple bookmarks:', error)
      return {}
    }

    const bookmarkedIds = new Set(data?.map(item => item.item_id) || [])
    const result: Record<string, boolean> = {}
    
    itemIds.forEach(id => {
      result[id] = bookmarkedIds.has(id)
    })

    return result
  }
}

export const bookmarkService = new BookmarkService()