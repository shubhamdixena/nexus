import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'

interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  date_of_birth?: string
  nationality?: string
  current_location?: string
  education_level?: string
  field_of_study?: string
  work_experience_years?: number
  english_proficiency?: string
  gmat_score?: number
  gre_score?: number
  ielts_score?: number
  toefl_score?: number
  target_countries?: string[]
  budget_range?: string
  preferred_intake?: string
  career_goals?: string
  linkedin_url?: string
  created_at: string
  updated_at: string
}

interface MenuOption {
  id: string
  title: string
  description: string
  icon: string
  onPress: () => void
  showBadge?: boolean
  badgeCount?: number
}

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [completion, setCompletion] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState<Partial<Profile>>({})

  // Menu options for the enhanced profile screen
  const menuOptions: MenuOption[] = [
    {
      id: 'applications',
      title: 'Application Manager',
      description: 'Manage your university applications',
      icon: '📝',
      onPress: () => {
        // Navigate to applications tab
        navigation.navigate('Applications')
      },
      showBadge: true,
      badgeCount: 3, // TODO: Get actual count from API
    },
    {
      id: 'documents',
      title: 'Document Center',
      description: 'Upload and manage your documents',
      icon: '📄',
      onPress: () => {
        navigation.navigate('Documents')
      },
    },
    {
      id: 'timeline',
      title: 'My Timeline',
      description: 'View important deadlines and dates',
      icon: '📅',
      onPress: () => {
        navigation.navigate('Timeline')
      },
    },
    {
      id: 'settings',
      title: 'Account Settings',
      description: 'Update your account preferences',
      icon: '⚙️',
      onPress: () => {
        navigation.navigate('Settings')
      },
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      description: 'Manage your notification preferences',
      icon: '🔔',
      onPress: () => {
        navigation.navigate('Settings')
      },
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get help or contact support',
      icon: '❓',
      onPress: () => {
        navigation.navigate('Help')
      },
    },
  ]

  const fetchProfile = useCallback(async () => {
    if (!user) return

    try {
      const data = await apiService.getProfile()
      setProfile(data.profile)
      calculateCompletion(data.profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchProfile()
  }, [fetchProfile])

  const calculateCompletion = (profileData: Profile) => {
    const fields = [
      'full_name', 'phone', 'date_of_birth', 'nationality', 'current_location',
      'education_level', 'field_of_study', 'work_experience_years',
      'english_proficiency', 'target_countries', 'budget_range',
      'preferred_intake', 'career_goals'
    ]
    
    const completedFields = fields.filter(field => {
      const value = profileData[field as keyof Profile]
      return value !== null && value !== undefined && value !== ''
    }).length
    
    const percentage = Math.round((completedFields / fields.length) * 100)
    setCompletion(percentage)
  }

  const handleEditProfile = () => {
    setEditData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      nationality: profile?.nationality || '',
      current_location: profile?.current_location || '',
    })
    setShowEditModal(true)
  }

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = await apiService.updateProfile(editData)
      setProfile(updatedProfile)
      calculateCompletion(updatedProfile)
      setShowEditModal(false)
      Alert.alert('Success', 'Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      Alert.alert('Error', 'Failed to update profile')
    }
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    )
  }

  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return '#10b981'
    if (completion >= 50) return '#f59e0b'
    return '#ef4444'
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name?.charAt(0).toUpperCase() || 
                 user?.email?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {profile?.full_name || 'Complete your profile'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Completion */}
          <View style={styles.completionSection}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={styles.completionPercentage}>{completion}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${completion}%`, backgroundColor: getCompletionColor(completion) }
                ]} 
              />
            </View>
            <Text style={styles.completionSubtext}>
              Complete your profile to get better recommendations
            </Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuItem}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>{option.icon}</Text>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{option.title}</Text>
                  <Text style={styles.menuItemDescription}>{option.description}</Text>
                </View>
              </View>
              <View style={styles.menuItemRight}>
                {option.showBadge && option.badgeCount && option.badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{option.badgeCount}</Text>
                  </View>
                )}
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Profile Info */}
        <View style={styles.quickInfoSection}>
          <Text style={styles.sectionTitle}>Quick Info</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Education Level" value={profile?.education_level || 'Not provided'} />
            <InfoRow label="Field of Study" value={profile?.field_of_study || 'Not provided'} />
            <InfoRow label="Target Countries" value={profile?.target_countries?.join(', ') || 'Not provided'} />
            <InfoRow label="Budget Range" value={profile?.budget_range || 'Not provided'} />
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={editData.full_name}
              onChangeText={(text) => setEditData({ ...editData, full_name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={editData.phone}
              onChangeText={(text) => setEditData({ ...editData, phone: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Nationality"
              value={editData.nationality}
              onChangeText={(text) => setEditData({ ...editData, nationality: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Current Location"
              value={editData.current_location}
              onChangeText={(text) => setEditData({ ...editData, current_location: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// Helper component for info rows
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  editButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completionSection: {
    marginTop: 10,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  completionPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completionSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  menuSection: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chevron: {
    fontSize: 20,
    color: '#9ca3af',
  },
  quickInfoSection: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  infoCard: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  signOutSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
