interface ActivityLogData {
  action: string
  resource: string
  details?: string
}

// Enhanced activity logger with automatic tracking
class ActivityLoggerClass {
  private isEnabled = true
  private queue: ActivityLogData[] = []
  private isProcessing = false

  // Enable/disable logging
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  // Log activity with queue and retry mechanism
  async logActivity(data: ActivityLogData) {
    if (!this.isEnabled) return

    try {
      const response = await fetch('/api/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // Add to queue for retry if failed
        this.queue.push(data)
        console.warn('Failed to log user activity, added to queue:', response.statusText)
      }
    } catch (error) {
      // Add to queue for retry if network error
      this.queue.push(data)
      console.warn('Error logging user activity, added to queue:', error)
    }
  }

  // Process queued activities
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true
    const batch = this.queue.splice(0, 5) // Process 5 at a time

    for (const activity of batch) {
      try {
        await this.logActivity(activity)
      } catch (error) {
        // Re-add failed items back to queue
        this.queue.unshift(activity)
      }
    }

    this.isProcessing = false
  }

  // Auto-track page visits
  trackPageVisit(pageName: string, path?: string) {
    this.logActivity({
      action: 'Visited page',
      resource: 'Navigation',
      details: `${pageName}${path ? ` (${path})` : ''}`
    })
  }

  // Auto-track clicks
  trackClick(element: string, context?: string) {
    this.logActivity({
      action: 'Clicked',
      resource: 'UI Element',
      details: `${element}${context ? ` - ${context}` : ''}`
    })
  }

  // Auto-track form submissions
  trackFormSubmission(formName: string, success: boolean) {
    this.logActivity({
      action: success ? 'Submitted form' : 'Failed form submission',
      resource: 'Form',
      details: formName
    })
  }

  // Auto-track search queries
  trackSearch(query: string, resultsCount: number, searchType: string) {
    this.logActivity({
      action: 'Searched',
      resource: searchType,
      details: `"${query}" - ${resultsCount} results`
    })
  }

  // School/University activities
  bookmarkSchool(schoolName: string) {
    return this.logActivity({
      action: 'Bookmarked',
      resource: 'MBA School',
      details: schoolName
    })
  }

  unbookmarkSchool(schoolName: string) {
    return this.logActivity({
      action: 'Removed bookmark',
      resource: 'MBA School',
      details: schoolName
    })
  }

  viewSchoolDetails(schoolName: string) {
    return this.logActivity({
      action: 'Viewed details',
      resource: 'MBA School',
      details: schoolName
    })
  }

  // Application activities
  submitApplication(schoolName: string) {
    return this.logActivity({
      action: 'Submitted application',
      resource: 'Application',
      details: schoolName
    })
  }

  updateApplication(schoolName: string, status: string) {
    return this.logActivity({
      action: 'Updated application status',
      resource: 'Application',
      details: `${schoolName} - ${status}`
    })
  }

  // Profile activities
  updateProfile(section: string) {
    return this.logActivity({
      action: 'Updated profile',
      resource: 'Profile',
      details: section
    })
  }

  completeProfile() {
    return this.logActivity({
      action: 'Completed profile setup',
      resource: 'Profile',
      details: 'Profile setup completed'
    })
  }

  // Test score activities
  addTestScore(testType: string, score: string) {
    return this.logActivity({
      action: 'Added test score',
      resource: 'Test Scores',
      details: `${testType}: ${score}`
    })
  }

  updateTestScore(testType: string, score: string) {
    return this.logActivity({
      action: 'Updated test score',
      resource: 'Test Scores',
      details: `${testType}: ${score}`
    })
  }

  // Deadline activities
  createDeadline(title: string, type: string) {
    return this.logActivity({
      action: 'Created deadline',
      resource: 'Deadlines',
      details: `${type}: ${title}`
    })
  }

  completeDeadline(title: string) {
    return this.logActivity({
      action: 'Completed deadline',
      resource: 'Deadlines',
      details: title
    })
  }

  // SOP activities
  createSOP(university: string, program: string) {
    return this.logActivity({
      action: 'Created SOP',
      resource: 'SOP',
      details: `${university} - ${program}`
    })
  }

  updateSOP(university: string, program: string) {
    return this.logActivity({
      action: 'Updated SOP',
      resource: 'SOP',
      details: `${university} - ${program}`
    })
  }

  // Document activities
  uploadDocument(documentType: string, fileName: string) {
    return this.logActivity({
      action: 'Uploaded document',
      resource: 'Documents',
      details: `${documentType}: ${fileName}`
    })
  }

  // Search activities
  searchSchools(query: string, resultsCount: number) {
    return this.trackSearch(query, resultsCount, 'MBA Schools')
  }

  searchScholarships(query: string, resultsCount: number) {
    return this.trackSearch(query, resultsCount, 'Scholarships')
  }

  // Authentication activities
  login() {
    return this.logActivity({
      action: 'Login',
      resource: 'Authentication',
      details: 'User logged in'
    })
  }

  logout() {
    return this.logActivity({
      action: 'Logout',
      resource: 'Authentication',
      details: 'User logged out'
    })
  }

  // Filter activities
  filterSchools(filters: Record<string, any>, resultsCount: number) {
    return this.logActivity({
      action: 'Applied filters',
      resource: 'MBA Schools',
      details: `${Object.keys(filters).length} filters applied - ${resultsCount} results`
    })
  }

  // Comparison activities
  compareSchools(schoolNames: string[]) {
    return this.logActivity({
      action: 'Compared schools',
      resource: 'MBA Schools',
      details: `Compared ${schoolNames.length} schools: ${schoolNames.join(', ')}`
    })
  }

  // Export activities
  exportData(dataType: string, format: string) {
    return this.logActivity({
      action: 'Exported data',
      resource: 'Export',
      details: `${dataType} exported as ${format}`
    })
  }

  // Target school activities
  addTargetSchool(schoolName: string, priority: number) {
    return this.logActivity({
      action: 'Added target school',
      resource: 'Target Schools',
      details: `${schoolName} (Priority: ${priority})`
    })
  }

  removeTargetSchool(schoolName: string) {
    return this.logActivity({
      action: 'Removed target school',
      resource: 'Target Schools',
      details: schoolName
    })
  }

  updateTargetSchool(schoolName: string, changes: string) {
    return this.logActivity({
      action: 'Updated target school',
      resource: 'Target Schools',
      details: `${schoolName} - ${changes}`
    })
  }
}

// Create singleton instance
const ActivityLogger = new ActivityLoggerClass()

// Process queue periodically
setInterval(() => {
  ActivityLogger.processQueue()
}, 30000) // Every 30 seconds

// Legacy function for backward compatibility
export async function logUserActivity(data: ActivityLogData) {
  return ActivityLogger.logActivity(data)
}

export { ActivityLogger }
export default ActivityLogger 