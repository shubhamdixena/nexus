import type { User } from '@supabase/supabase-js'

// Utility function to get consistent user display name across the app
export const getUserDisplayName = (user: User | null, profileData?: any): string => {
  // Priority 1: Profile first name from database
  if (profileData?.first_name) {
    return profileData.first_name
  }
  
  // Priority 2: User metadata name (first part only)
  if (user?.user_metadata?.name) {
    return user.user_metadata.name.split(' ')[0]
  }
  
  // Priority 3: User metadata first_name
  if (user?.user_metadata?.first_name) {
    return user.user_metadata.first_name
  }
  
  // Priority 4: Extract from email with proper capitalization
  if (user?.email) {
    const emailPart = user.email.split('@')[0]
    // Capitalize first letter for better display
    return emailPart.charAt(0).toUpperCase() + emailPart.slice(1)
  }
  
  return "User"
}

// Utility function to get user full name
export const getUserFullName = (user: User | null, profileData?: any): string => {
  // Priority 1: Profile data from database
  if (profileData?.first_name || profileData?.last_name) {
    return `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
  }
  
  // Priority 2: User metadata full name
  if (user?.user_metadata?.name) {
    return user.user_metadata.name
  }
  
  // Priority 3: Combine user metadata first and last name
  if (user?.user_metadata?.first_name || user?.user_metadata?.last_name) {
    return `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}`.trim()
  }
  
  // Priority 4: Fallback to display name
  return getUserDisplayName(user, profileData)
}

// Utility function to get user initials for avatars
export const getUserInitials = (user: User | null, profileData?: any): string => {
  // Priority 1: Profile data from database
  if (profileData?.first_name || profileData?.last_name) {
    const first = profileData.first_name?.charAt(0) || ''
    const last = profileData.last_name?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
  }
  
  // Priority 2: User metadata name
  if (user?.user_metadata?.name) {
    const parts = user.user_metadata.name.split(' ')
    const first = parts[0]?.charAt(0) || ''
    const last = parts[1]?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
  }
  
  // Priority 3: User metadata first and last name
  if (user?.user_metadata?.first_name || user?.user_metadata?.last_name) {
    const first = user.user_metadata.first_name?.charAt(0) || ''
    const last = user.user_metadata.last_name?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
  }
  
  // Priority 4: Email fallback
  if (user?.email) {
    return user.email.charAt(0).toUpperCase()
  }
  
  return 'U'
}

// Utility function to get avatar URL
export const getUserAvatarUrl = (user: User | null, profileData?: any): string => {
  // Priority 1: Profile avatar from database
  if (profileData?.avatar_url) {
    return profileData.avatar_url
  }
  
  // Priority 2: User metadata avatar
  if (user?.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url
  }
  
  return ""
} 