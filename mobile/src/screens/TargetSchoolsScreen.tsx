import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { supabase } from '../utils/supabase'

interface TargetSchool {
  id: string
  school_id: string
  school_name: string
  target_category: 'target' | 'safety' | 'reach'
  priority_score: number
  application_round?: string
  deadline_date?: string
  created_at: string
}

export default function TargetSchoolsScreen() {
  const navigation = useNavigation()
  const { user } = useAuth()
  const [targets, setTargets] = useState<TargetSchool[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadTargets = useCallback(async () => {
    try {
      if (!user) return
      
      const data = await apiService.getSchoolTargets()
      if (data && Array.isArray(data.targets)) {
        setTargets(data.targets)
      } else {
        setTargets([])
      }
    } catch (error) {
      console.error('Error loading target schools:', error)
      Alert.alert('Error', 'Failed to load target schools')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    loadTargets()
  }, [loadTargets])

  // Keep screen updated in realtime when user's targets change
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`user-school-targets-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_school_targets',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        loadTargets()
      })
      .subscribe()
    return () => {
      try { supabase.removeChannel(channel) } catch {}
    }
  }, [user, loadTargets])

  // Move actions to navigation header
  useLayoutEffect(() => {
    (navigation as any).setOptions({
      title: 'Target Schools',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Schools')}
          style={{
            backgroundColor: '#2563eb',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            marginRight: 12,
          }}
        >
          <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>+ Add</Text>
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadTargets()
  }, [loadTargets])

  const handleRemoveTarget = async (targetId: string) => {
    Alert.alert(
      'Remove Target',
      'Are you sure you want to remove this school from your targets?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.removeSchoolTarget(targetId)
              loadTargets()
              Alert.alert('Success', 'School removed from targets')
            } catch (error) {
              console.error('Error removing target:', error)
              Alert.alert('Error', 'Failed to remove school from targets')
            }
          },
        },
      ]
    )
  }

  const handleSchoolPress = (target: TargetSchool) => {
    (navigation as any).navigate('SchoolDetails', { schoolId: target.school_id })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reach':
        return '#ef4444' // red
      case 'target':
        return '#3b82f6' // blue
      case 'safety':
        return '#10b981' // green
      default:
        return '#6b7280' // gray
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'reach':
        return 'Reach'
      case 'target':
        return 'Target'
      case 'safety':
        return 'Safety'
      default:
        return 'Unknown'
    }
  }

  const renderTarget = ({ item }: { item: TargetSchool }) => (
    <TouchableOpacity
      style={styles.targetCard}
      onPress={() => handleSchoolPress(item)}
    >
      <View style={styles.targetHeader}>
        <View style={styles.schoolInfo}>
          <Text style={styles.schoolName} numberOfLines={2}>
            {item.school_name}
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.target_category) }]}>
            <Text style={styles.categoryText}>{getCategoryLabel(item.target_category)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveTarget(item.id)}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      {item.application_round && (
        <Text style={styles.roundText}>Application Round: {item.application_round}</Text>
      )}
      
      {item.deadline_date && (
        <Text style={styles.deadlineText}>
          Deadline: {new Date(item.deadline_date).toLocaleDateString()}
        </Text>
      )}
      
      <View style={styles.priorityContainer}>
        <Text style={styles.priorityLabel}>Priority Score:</Text>
        <Text style={styles.priorityScore}>{item.priority_score}/10</Text>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
  <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading target schools...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
  <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
      {targets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Target Schools</Text>
          <Text style={styles.emptySubtitle}>
            Browse schools and add them to your targets to track your application progress.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => (navigation as any).navigate('Schools')}
          >
            <Text style={styles.browseButtonText}>Browse Schools</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={targets}
          keyExtractor={(item) => item.id}
          renderItem={renderTarget}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
  },
  targetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  targetHeader: {
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  roundText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  deadlineText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priorityScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
})
