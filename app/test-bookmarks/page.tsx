"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { useAuth } from '@/components/auth-provider'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'

export default function TestBookmarksPage() {
  const { user } = useAuth()
  const [testSchoolId] = useState('d5ec3a75-7943-4932-946d-a0288063cd42') // Sample MBA school ID
  
  const {
    bookmarkedItems,
    isBookmarked,
    toggleBookmark,
    loading,
    error
  } = useBookmarks('mba_school')

  const [testing, setTesting] = useState(false)

  const handleTestBookmark = async () => {
    setTesting(true)
    try {
      await toggleBookmark(testSchoolId)
      console.log('Bookmark toggle successful')
    } catch (error) {
      console.error('Bookmark toggle failed:', error)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Bookmark Functionality Test</CardTitle>
          <CardDescription>
            This page tests the bookmark functionality to ensure it's working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Authentication Status</h3>
            <p className="text-sm">
              User: {user ? user.email : 'Not authenticated'}
            </p>
            <p className="text-sm">
              Status: {user ? '✅ Logged in' : '❌ Not logged in'}
            </p>
          </div>

          {/* Bookmark Status */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Bookmark Service Status</h3>
            <p className="text-sm">Loading: {loading ? 'Yes' : 'No'}</p>
            <p className="text-sm">Error: {error || 'None'}</p>
            <p className="text-sm">Total bookmarks: {bookmarkedItems.length}</p>
            <p className="text-sm">
              Test school bookmarked: {isBookmarked(testSchoolId) ? 'Yes' : 'No'}
            </p>
          </div>

          {/* Test Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold">Test Actions</h3>
            {user ? (
              <Button 
                onClick={handleTestBookmark}
                disabled={testing || loading}
                className="w-full"
              >
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    {isBookmarked(testSchoolId) ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Remove Test Bookmark
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Add Test Bookmark
                      </>
                    )}
                  </>
                )}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Please log in to test bookmark functionality. Go to /auth/login
              </p>
            )}
          </div>

          {/* Debug Information */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                user: user ? { id: user.id, email: user.email } : null,
                bookmarkedItems: bookmarkedItems,
                loading,
                error,
                testSchoolId,
                isBookmarked: isBookmarked(testSchoolId)
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 