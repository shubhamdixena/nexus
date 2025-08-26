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
  Platform,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'

interface Deadline {
  id: string
  title: string
  deadline_type: 'application' | 'scholarship' | 'test' | 'reminder' | 'interview'
  priority: 'high' | 'medium' | 'low'
  deadline_date: string
  notes?: string
  completed: boolean
  created_at: string
  updated_at: string
}

export default function TimelineScreen() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    deadline_type: 'application' as const,
    priority: 'medium' as const,
    deadline_date: '',
    notes: '',
  })
  const [showDatePicker, setShowDatePicker] = useState(false)

  const loadDeadlines = useCallback(async () => {
    try {
      if (!user) return
      
      const data = await apiService.getDeadlines()
      setDeadlines(data)
    } catch (error) {
      console.error('Error loading deadlines:', error)
      Alert.alert('Error', 'Failed to load timeline')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    loadDeadlines()
  }, [loadDeadlines])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadDeadlines()
  }, [loadDeadlines])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'application':
        return '#ef4444' // red
      case 'scholarship':
        return '#3b82f6' // blue
      case 'test':
        return '#f59e0b' // yellow
      case 'interview':
        return '#10b981' // green
      case 'reminder':
        return '#8b5cf6' // purple
      default:
        return '#6b7280' // gray
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444' // red
      case 'medium':
        return '#f59e0b' // yellow
      case 'low':
        return '#10b981' // green
      default:
        return '#6b7280' // gray
    }
  }

  const isOverdue = (date: string) => {
    return new Date(date) < new Date() && !isToday(date)
  }

  const isToday = (date: string) => {
    const today = new Date()
    const deadlineDate = new Date(date)
    return today.toDateString() === deadlineDate.toDateString()
  }

  const isUpcoming = (date: string) => {
    const now = new Date()
    const deadline = new Date(date)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  const handleToggleComplete = async (deadline: Deadline) => {
    try {
      await apiService.updateDeadline(deadline.id, {
        completed: !deadline.completed
      })
      loadDeadlines()
    } catch (error) {
      console.error('Error updating deadline:', error)
      Alert.alert('Error', 'Failed to update deadline')
    }
  }

  const handleAddDeadline = async () => {
    if (!formData.title || !formData.deadline_date) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    try {
      await apiService.createDeadline({
        ...formData,
        completed: false
      })
      setShowAddModal(false)
      setFormData({
        title: '',
        deadline_type: 'application',
        priority: 'medium',
        deadline_date: '',
        notes: '',
      })
      loadDeadlines()
      Alert.alert('Success', 'Deadline added successfully!')
    } catch (error) {
      console.error('Error adding deadline:', error)
      Alert.alert('Error', 'Failed to add deadline')
    }
  }

  const sortedDeadlines = deadlines.sort((a, b) => {
    // Sort by date, then by priority
    const dateA = new Date(a.deadline_date)
    const dateB = new Date(b.deadline_date)
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime()
    }
    
    // If dates are same, sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const upcomingDeadlines = sortedDeadlines.filter(d => !d.completed && isUpcoming(d.deadline_date))
  const overdueDeadlines = sortedDeadlines.filter(d => !d.completed && isOverdue(d.deadline_date))

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading timeline...</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Timeline</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Overdue Section */}
        {overdueDeadlines.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>
              ⚠️ Overdue ({overdueDeadlines.length})
            </Text>
            {overdueDeadlines.map((deadline) => (
              <TouchableOpacity
                key={deadline.id}
                style={[styles.deadlineCard, { borderLeftColor: '#ef4444' }]}
                onPress={() => handleToggleComplete(deadline)}
              >
                <View style={styles.deadlineHeader}>
                  <View style={styles.deadlineInfo}>
                    <Text style={[styles.deadlineTitle, deadline.completed && styles.completedText]}>
                      {deadline.title}
                    </Text>
                    <Text style={styles.deadlineDate}>
                      {new Date(deadline.deadline_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.badges}>
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(deadline.deadline_type) }]}>
                      <Text style={styles.badgeText}>{deadline.deadline_type}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(deadline.priority) }]}>
                      <Text style={styles.badgeText}>{deadline.priority}</Text>
                    </View>
                  </View>
                </View>
                {deadline.notes && (
                  <Text style={styles.deadlineNotes}>{deadline.notes}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Section */}
        {upcomingDeadlines.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>
              🔔 Upcoming (Next 7 Days)
            </Text>
            {upcomingDeadlines.map((deadline) => (
              <TouchableOpacity
                key={deadline.id}
                style={[styles.deadlineCard, { borderLeftColor: '#f59e0b' }]}
                onPress={() => handleToggleComplete(deadline)}
              >
                <View style={styles.deadlineHeader}>
                  <View style={styles.deadlineInfo}>
                    <Text style={[styles.deadlineTitle, deadline.completed && styles.completedText]}>
                      {deadline.title}
                    </Text>
                    <Text style={styles.deadlineDate}>
                      {new Date(deadline.deadline_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.badges}>
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(deadline.deadline_type) }]}>
                      <Text style={styles.badgeText}>{deadline.deadline_type}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(deadline.priority) }]}>
                      <Text style={styles.badgeText}>{deadline.priority}</Text>
                    </View>
                  </View>
                </View>
                {deadline.notes && (
                  <Text style={styles.deadlineNotes}>{deadline.notes}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* All Deadlines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Deadlines</Text>
          {sortedDeadlines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No deadlines yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first deadline to start tracking important dates
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.primaryButtonText}>Add Deadline</Text>
              </TouchableOpacity>
            </View>
          ) : (
            sortedDeadlines.map((deadline) => (
              <TouchableOpacity
                key={deadline.id}
                style={[
                  styles.deadlineCard,
                  {
                    borderLeftColor: isOverdue(deadline.deadline_date) && !deadline.completed
                      ? '#ef4444'
                      : isUpcoming(deadline.deadline_date) && !deadline.completed
                      ? '#f59e0b'
                      : isToday(deadline.deadline_date)
                      ? '#10b981'
                      : '#e2e8f0',
                    opacity: deadline.completed ? 0.6 : 1
                  }
                ]}
                onPress={() => handleToggleComplete(deadline)}
              >
                <View style={styles.deadlineHeader}>
                  <View style={styles.deadlineInfo}>
                    <Text style={[styles.deadlineTitle, deadline.completed && styles.completedText]}>
                      {deadline.completed ? '✓ ' : ''}{deadline.title}
                    </Text>
                    <Text style={styles.deadlineDate}>
                      {new Date(deadline.deadline_date).toLocaleDateString()}
                      {isToday(deadline.deadline_date) && ' (Today)'}
                    </Text>
                  </View>
                  <View style={styles.badges}>
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(deadline.deadline_type) }]}>
                      <Text style={styles.badgeText}>{deadline.deadline_type}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(deadline.priority) }]}>
                      <Text style={styles.badgeText}>{deadline.priority}</Text>
                    </View>
                  </View>
                </View>
                {deadline.notes && (
                  <Text style={styles.deadlineNotes}>{deadline.notes}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Deadline Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Deadline</Text>
            <TouchableOpacity onPress={handleAddDeadline}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Enter deadline title"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, !formData.deadline_date && styles.placeholderText]}>
                  {formData.deadline_date || 'Select deadline date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.radioGroup}>
                {['application', 'scholarship', 'test', 'interview', 'reminder'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.radioOption,
                      formData.deadline_type === type && styles.radioOptionSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, deadline_type: type as any }))}
                  >
                    <Text style={[
                      styles.radioText,
                      formData.deadline_type === type && styles.radioTextSelected
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.radioGroup}>
                {['high', 'medium', 'low'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.radioOption,
                      formData.priority === priority && styles.radioOptionSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, priority: priority as any }))}
                  >
                    <Text style={[
                      styles.radioText,
                      formData.priority === priority && styles.radioTextSelected
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Enter notes (optional)"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContent}>
            <Text style={styles.datePickerTitle}>Select Date</Text>
            <TextInput
              style={styles.input}
              value={formData.deadline_date}
              onChangeText={(text) => setFormData(prev => ({ ...prev, deadline_date: text }))}
              placeholder="YYYY-MM-DD"
              autoFocus
            />
            <View style={styles.datePickerButtons}>
              <TouchableOpacity
                style={styles.datePickerCancel}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePickerConfirm}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerConfirmText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  deadlineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  deadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  deadlineInfo: {
    flex: 1,
    marginRight: 12,
  },
  deadlineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  deadlineDate: {
    fontSize: 14,
    color: '#64748b',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deadlineNotes: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  cancelButton: {
    color: '#64748b',
    fontSize: 16,
  },
  saveButton: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#1e293b',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  radioOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  radioText: {
    fontSize: 14,
    color: '#1e293b',
  },
  radioTextSelected: {
    color: 'white',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '80%',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  datePickerCancel: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerCancelText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerConfirm: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
