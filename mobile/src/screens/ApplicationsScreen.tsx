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
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { useNavigation } from '@react-navigation/native'

interface ApplicationProgress {
  id: string
  mba_school_id: string
  application_status: string
  notes?: string
  priority_level?: number
  created_at: string
  updated_at: string
  school?: {
    id: string
    business_school: string
    location: string
    country: string
  }
}

interface ApplicationDashboardData {
  total_essays: number
  completed_essays: number
  total_lors: number
  completed_lors: number
  applications: ApplicationProgress[]
}

export default function ApplicationsScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dashboardData, setDashboardData] = useState<ApplicationDashboardData | null>(null)

  const loadApplications = useCallback(async () => {
    try {
      if (!user) return
      
      const apps = await apiService.getApplications()
      // Synthesize minimal dashboard metrics from applications list
      const submitted = apps.filter((a: any) => a.application_status === 'submitted').length
      const dashboard: ApplicationDashboardData = {
        total_essays: 0,
        completed_essays: 0,
        total_lors: 0,
        completed_lors: 0,
        applications: apps as any,
      }
      setDashboardData(dashboard)
    } catch (error) {
      console.error('Error loading applications:', error)
      Alert.alert('Error', 'Failed to load applications')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadApplications()
  }, [loadApplications])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return '#22c55e' // green
      case 'draft_completed':
        return '#3b82f6' // blue
      case 'essays_working':
        return '#f59e0b' // yellow
      case 'not_started':
        return '#6b7280' // gray
      default:
        return '#6b7280'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted'
      case 'draft_completed':
        return 'Draft Complete'
      case 'essays_working':
        return 'Working on Essays'
      case 'not_started':
        return 'Not Started'
      default:
        return status
    }
  }

  const calculateProgress = (application: ApplicationProgress) => {
    // Basic progress calculation based on status
    switch (application.application_status) {
      case 'submitted':
        return 100
      case 'draft_completed':
        return 80
      case 'essays_working':
        return 50
      case 'not_started':
        return 10
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const applications = dashboardData?.applications || []

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Applications</Text>
          <Text style={styles.subtitle}>
            Track your MBA application progress
          </Text>
        </View>

        {/* Summary Stats */}
        {dashboardData && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{applications.length}</Text>
              <Text style={styles.statLabel}>Total Applications</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {applications.filter(app => app.application_status === 'submitted').length}
              </Text>
              <Text style={styles.statLabel}>Submitted</Text>
            </View>
          </View>
        )}

        {/* Essay & LOR Stats */}
        {dashboardData && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboardData.completed_essays}/{dashboardData.total_essays}
              </Text>
              <Text style={styles.statLabel}>Essays Complete</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {dashboardData.completed_lors}/{dashboardData.total_lors}
              </Text>
              <Text style={styles.statLabel}>LORs Complete</Text>
            </View>
          </View>
        )}

        {/* Applications List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Applications</Text>
          
          {applications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No applications yet</Text>
              <Text style={styles.emptySubtext}>
                Start by adding schools to your targets, then track your applications here.
              </Text>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => (navigation as any).navigate('Schools')}
              >
                <Text style={styles.primaryButtonText}>Browse Schools</Text>
              </TouchableOpacity>
            </View>
          ) : (
            applications.map((application) => (
              <TouchableOpacity
                key={application.id}
                style={styles.applicationCard}
                onPress={() => {
                  // Navigate to application details (to be implemented)
                  Alert.alert('Coming Soon', 'Application details screen coming soon!')
                }}
              >
                <View style={styles.applicationHeader}>
                  <View style={styles.schoolInfo}>
                    <Text style={styles.schoolName} numberOfLines={2}>
                      {application.school?.business_school || 'Unknown School'}
                    </Text>
                    <Text style={styles.schoolLocation}>
                      📍 {application.school?.location}, {application.school?.country}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(application.application_status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusLabel(application.application_status)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${calculateProgress(application)}%`,
                          backgroundColor: getStatusColor(application.application_status)
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {calculateProgress(application)}% Complete
                  </Text>
                </View>

                {application.notes && (
                  <Text style={styles.notes} numberOfLines={2}>
                    📝 {application.notes}
                  </Text>
                )}

                <Text style={styles.updatedAt}>
                  Updated: {new Date(application.updated_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  applicationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  schoolInfo: {
    flex: 1,
    marginRight: 12,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  schoolLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },
  notes: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  updatedAt: {
    fontSize: 12,
    color: '#94a3b8',
  },
})
