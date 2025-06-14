interface ActivityLogData {
  action: string
  resource: string
  details?: string
}

export async function logUserActivity(data: ActivityLogData) {
  try {
    const response = await fetch('/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      console.error('Failed to log user activity:', response.statusText)
    }
  } catch (error) {
    console.error('Error logging user activity:', error)
  }
}

// Helper functions for common activities
export const ActivityLogger = {
  // School/University activities
  bookmarkSchool: (schoolName: string) => 
    logUserActivity({
      action: 'Bookmarked',
      resource: 'MBA School',
      details: schoolName
    }),

  unbookmarkSchool: (schoolName: string) => 
    logUserActivity({
      action: 'Removed bookmark',
      resource: 'MBA School',
      details: schoolName
    }),

  // Application activities
  submitApplication: (schoolName: string) => 
    logUserActivity({
      action: 'Submitted application',
      resource: 'Application',
      details: schoolName
    }),

  updateApplication: (schoolName: string, status: string) => 
    logUserActivity({
      action: 'Updated application status',
      resource: 'Application',
      details: `${schoolName} - ${status}`
    }),

  // Profile activities
  updateProfile: (section: string) => 
    logUserActivity({
      action: 'Updated profile',
      resource: 'Profile',
      details: section
    }),

  completeProfile: () => 
    logUserActivity({
      action: 'Completed profile setup',
      resource: 'Profile',
      details: 'Profile setup completed'
    }),

  // Test score activities
  addTestScore: (testType: string, score: string) => 
    logUserActivity({
      action: 'Added test score',
      resource: 'Test Scores',
      details: `${testType}: ${score}`
    }),

  updateTestScore: (testType: string, score: string) => 
    logUserActivity({
      action: 'Updated test score',
      resource: 'Test Scores',
      details: `${testType}: ${score}`
    }),

  // Deadline activities
  createDeadline: (title: string, type: string) => 
    logUserActivity({
      action: 'Created deadline',
      resource: 'Deadlines',
      details: `${type}: ${title}`
    }),

  completeDeadline: (title: string) => 
    logUserActivity({
      action: 'Completed deadline',
      resource: 'Deadlines',
      details: title
    }),

  // SOP activities
  createSOP: (university: string, program: string) => 
    logUserActivity({
      action: 'Created SOP',
      resource: 'SOP',
      details: `${university} - ${program}`
    }),

  updateSOP: (university: string, program: string) => 
    logUserActivity({
      action: 'Updated SOP',
      resource: 'SOP',
      details: `${university} - ${program}`
    }),

  // Document activities
  uploadDocument: (documentType: string, fileName: string) => 
    logUserActivity({
      action: 'Uploaded document',
      resource: 'Documents',
      details: `${documentType}: ${fileName}`
    }),

  // General navigation
  visitPage: (pageName: string) => 
    logUserActivity({
      action: 'Visited page',
      resource: 'Navigation',
      details: pageName
    }),

  // Search activities
  searchSchools: (query: string, resultsCount: number) => 
    logUserActivity({
      action: 'Searched schools',
      resource: 'Search',
      details: `"${query}" - ${resultsCount} results`
    }),

  searchScholarships: (query: string, resultsCount: number) => 
    logUserActivity({
      action: 'Searched scholarships',
      resource: 'Search',
      details: `"${query}" - ${resultsCount} results`
    }),

  // Authentication activities
  login: () => 
    logUserActivity({
      action: 'Login',
      resource: 'Authentication',
      details: 'User logged in'
    }),

  logout: () => 
    logUserActivity({
      action: 'Logout',
      resource: 'Authentication',
      details: 'User logged out'
    }),

  // Filter activities
  filterSchools: (filters: Record<string, any>, resultsCount: number) => 
    logUserActivity({
      action: 'Applied filters',
      resource: 'MBA Schools',
      details: `${Object.keys(filters).length} filters applied - ${resultsCount} results`
    }),

  // Comparison activities
  compareSchools: (schoolNames: string[]) => 
    logUserActivity({
      action: 'Compared schools',
      resource: 'MBA Schools',
      details: `Compared ${schoolNames.length} schools: ${schoolNames.join(', ')}`
    }),

  // Export activities
  exportData: (dataType: string, format: string) => 
    logUserActivity({
      action: 'Exported data',
      resource: 'Export',
      details: `${dataType} exported as ${format}`
    }),
} 