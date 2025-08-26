import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import { supabase } from '../utils/supabase'

const { width } = Dimensions.get('window')
const CALENDAR_CELL_SIZE = (width - 40) / 7 // 7 days per week, 20px padding on each side

// Types for different deadline sources
interface PersonalDeadline {
  id: string
  title: string
  deadline_type: 'application' | 'scholarship' | 'test' | 'reminder' | 'interview'
  priority: 'high' | 'medium' | 'low'
  deadline_date: string
  notes?: string
  completed: boolean
  source_type: 'manual'
  created_at: string
  updated_at: string
}

interface SchoolDeadline {
  id: string
  school_id: string
  school_name: string
  deadline_date: string
  round: string
  location: string
  application_fee?: string
  is_active: boolean
  source_type: 'school_deadline'
}

interface ScholarshipDeadline {
  id: string
  name: string
  provider?: string
  deadline: string
  amount?: string
  country?: string
  source_type: 'scholarship'
}

interface UserSchoolTarget {
  id: string
  school_id: string
  school_name: string
  application_round?: string
  deadline_date?: string
  priority_score: number
  target_category: 'target' | 'safety' | 'reach'
}

type CalendarDeadline = {
  id: string
  deadline_date: string
  calendar_type: 'personal' | 'school' | 'scholarship' | 'target'
  display_title: string
  display_subtitle?: string
  color: string
  is_important: boolean
  source_type: string
  // Additional fields that might exist on specific types
  [key: string]: any
}

interface CalendarFilters {
  showPersonal: boolean
  showSchoolDeadlines: boolean
}

export default function CalendarScreen({ navigation }: any) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [personalDeadlines, setPersonalDeadlines] = useState<PersonalDeadline[]>([])
  const [schoolDeadlines, setSchoolDeadlines] = useState<SchoolDeadline[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDateDetailsModal, setShowDateDetailsModal] = useState(false)
  
  const [filters, setFilters] = useState<CalendarFilters>({
    showPersonal: true,
    showSchoolDeadlines: true,
  })

  const [formData, setFormData] = useState({
    title: '',
    deadline_type: 'application' as const,
    priority: 'medium' as const,
    deadline_date: '',
    notes: '',
  })

  const loadAllDeadlines = useCallback(async () => {
    if (!user) {
      console.log('No user available for loading personal deadlines')
      // Still load school deadlines for everyone
    }

    try {
      setLoading(true)

      // Get month range for API calls
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const startDate = monthStart.toISOString().split('T')[0]
      const endDate = monthEnd.toISOString().split('T')[0]

      // Load personal deadlines (only if user is authenticated)
      if (user && filters.showPersonal) {
        try {
          const personalData = await apiService.getDeadlines()
          if (Array.isArray(personalData)) {
            // Filter to current month
            const monthPersonalDeadlines = personalData.filter(deadline => {
              const deadlineDate = new Date(deadline.deadline_date)
              return deadlineDate >= monthStart && deadlineDate <= monthEnd
            })
            setPersonalDeadlines(monthPersonalDeadlines.filter(deadline => deadline && deadline.deadline_date))
          }
        } catch (error) {
          console.error('Error loading personal deadlines:', error)
          setPersonalDeadlines([])
        }
      } else {
        setPersonalDeadlines([])
      }

      // Load school deadlines directly from Supabase (works with or without web API)
      if (filters.showSchoolDeadlines) {
        try {
          const { data: schools, error } = await supabase
            .from('mba_schools')
            .select(`
              id,
              business_school,
              r1_deadline,
              r2_deadline,
              r3_deadline,
              r4_deadline,
              r5_deadline,
              location,
              application_fee
            `)

          if (error) {
            console.error('Supabase error fetching school deadlines:', error)
            setSchoolDeadlines([])
          } else {
            // Transform and filter by selected month
            const deadlines: SchoolDeadline[] = []
            ;(schools || []).forEach((school: any) => {
              const entries = [
                { round: 'R1', date: school.r1_deadline },
                { round: 'R2', date: school.r2_deadline },
                { round: 'R3', date: school.r3_deadline },
                { round: 'R4', date: school.r4_deadline },
                { round: 'R5', date: school.r5_deadline },
              ]
              entries.forEach(entry => {
                if (entry.date) {
                  const d = new Date(entry.date)
                  if (!isNaN(d.getTime()) && d >= monthStart && d <= monthEnd) {
                    deadlines.push({
                      id: `${school.id}-${entry.round}`,
                      school_id: school.id,
                      school_name: school.business_school,
                      deadline_date: d.toISOString(),
                      round: entry.round,
                      location: school.location,
                      application_fee: school.application_fee,
                      is_active: true,
                      source_type: 'school_deadline',
                    })
                  }
                }
              })
            })
            setSchoolDeadlines(deadlines)
          }
        } catch (error) {
          console.error('Error loading school deadlines via Supabase:', error)
          setSchoolDeadlines([])
        }
      } else {
        setSchoolDeadlines([])
      }

    } catch (error) {
      console.error('Error loading calendar deadlines:', error)
      Alert.alert('Error', 'Failed to load calendar data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user, filters, currentDate])

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const calendarDays = []
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day))
    }
    
    return calendarDays
  }

  const getDeadlinesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    
    const personalDeadlinesForDate = personalDeadlines
      .filter(deadline => deadline.deadline_date.startsWith(dateStr))
      .map(deadline => ({
        ...deadline,
        calendar_type: 'personal' as const,
        display_title: deadline.title || 'Untitled Deadline',
        color: getTypeColor(deadline.deadline_type),
        is_important: deadline.priority === 'high',
        source_type: 'manual' as const
      }))

    const schoolDeadlinesForDate = schoolDeadlines
      .filter(deadline => deadline.deadline_date.startsWith(dateStr))
      .map(deadline => ({
        ...deadline,
        calendar_type: 'school' as const,
        display_title: `${deadline.school_name} - ${deadline.round}`,
        color: '#ef4444',
        is_important: deadline.round === 'R1' || deadline.round === 'R2',
        source_type: 'school_deadline' as const
      }))

    return [...personalDeadlinesForDate, ...schoolDeadlinesForDate]
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleDatePress = (date: Date) => {
    setSelectedDate(date)
    const dayDeadlines = getDeadlinesForDate(date)
    
    if (dayDeadlines.length > 0) {
      setShowDateDetailsModal(true)
    } else if (user) {
      // No deadlines, show add modal for authenticated users
      setFormData(prev => ({
        ...prev,
        deadline_date: date.toISOString().split('T')[0]
      }))
      setShowAddModal(true)
    } else {
      Alert.alert('No Deadlines', 'No deadlines for this date. Sign in to add personal deadlines.')
    }
  }

  useEffect(() => {
    loadAllDeadlines()
  }, [loadAllDeadlines])

  // Realtime subscriptions for instant updates
  useEffect(() => {
    const channels: any[] = []

    // Personal deadlines for the current user
    if (user) {
      const deadlinesChannel = supabase
        .channel(`deadlines-user-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'deadlines',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          // Reload personal deadlines on any change
          loadAllDeadlines()
        })
        .subscribe()
      channels.push(deadlinesChannel)
    }

    // School deadlines (any updates on mba_schools)
    const schoolsChannel = supabase
      .channel('mba-schools-deadlines')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mba_schools',
      }, () => {
        loadAllDeadlines()
      })
      .subscribe()
    channels.push(schoolsChannel)

    return () => {
      channels.forEach(ch => {
        try {
          supabase.removeChannel(ch)
        } catch (e) {
          // ignore
        }
      })
    }
  }, [user, loadAllDeadlines])

  // Move actions to navigation header to avoid duplicate in-screen header
  useLayoutEffect(() => {
    if (!navigation) return
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={{
              backgroundColor: '#f3f4f6',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              marginRight: 10,
            }}
          >
            <Text style={{ fontSize: 14, color: '#374151', fontWeight: '500' }}>Filters</Text>
          </TouchableOpacity>
          {user && (
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={{
                backgroundColor: '#2563eb',
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    })
  }, [navigation, user])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadAllDeadlines()
  }, [loadAllDeadlines])

  const getAllDeadlines = () => {
    const personalMapped = personalDeadlines.map(deadline => ({
      ...deadline,
      calendar_type: 'personal' as const,
      display_title: deadline.title || 'Untitled Deadline',
      color: getTypeColor(deadline.deadline_type),
      is_important: deadline.priority === 'high'
    }))

    const schoolMapped = schoolDeadlines.map(deadline => ({
      ...deadline,
      calendar_type: 'school' as const,
      display_title: `${deadline.school_name} - ${deadline.round}`,
      color: '#ef4444',
      is_important: deadline.round === 'R1' || deadline.round === 'R2',
      deadline_type: 'application' as const,
      priority: 'medium' as const,
      title: `${deadline.school_name} - ${deadline.round}`
    }))

    return [...personalMapped, ...schoolMapped]
  }

  const renderCalendarDay = (date: Date | null, index: number) => {
    if (!date) {
      return <View key={index} style={[styles.calendarDay, styles.emptyDay]} />
    }

    const dayDeadlines = getDeadlinesForDate(date)
    const isToday = new Date().toDateString() === date.toDateString()
    const isCurrentMonth = date.getMonth() === currentDate.getMonth()

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          !isCurrentMonth && styles.otherMonthDay,
          isToday && styles.todayDay
        ]}
        onPress={() => handleDatePress(date)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dayNumber,
          !isCurrentMonth && styles.otherMonthText,
          isToday && styles.todayText
        ]}>
          {date.getDate()}
        </Text>
        
        <View style={styles.deadlineIndicators}>
          {dayDeadlines.slice(0, 3).map((deadline, idx) => (
            <View
              key={idx}
              style={[
                styles.deadlineIndicator,
                { backgroundColor: deadline.color }
              ]}
            />
          ))}
          {dayDeadlines.length > 3 && (
            <Text style={styles.moreIndicator}>+{dayDeadlines.length - 3}</Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const renderCalendarHeader = () => {
    const monthYear = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`

    return (
      <>
        {/* Month navigation under native header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthYear}>{monthYear}</Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  const renderWeekHeaders = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    return (
      <View style={styles.weekHeaders}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekHeader}>
            <Text style={styles.weekHeaderText}>{day}</Text>
          </View>
        ))}
      </View>
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'application': return '#ef4444' // red
      case 'scholarship': return '#3b82f6' // blue
      case 'test': return '#f59e0b' // yellow
      case 'interview': return '#10b981' // green
      case 'reminder': return '#8b5cf6' // purple
      default: return '#6b7280' // gray
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reach': return '#ef4444' // red
      case 'target': return '#f59e0b' // yellow
      case 'safety': return '#10b981' // green
      default: return '#6b7280' // gray
    }
  }

  const isOverdue = (date: string) => {
    try {
      if (!date) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadlineDate = new Date(date)
      if (isNaN(deadlineDate.getTime())) return false
      deadlineDate.setHours(0, 0, 0, 0)
      return deadlineDate < today
    } catch (error) {
      console.error('Error checking if date is overdue:', error)
      return false
    }
  }

  const isToday = (date: string) => {
    try {
      if (!date) return false
      const today = new Date()
      const deadlineDate = new Date(date)
      if (isNaN(deadlineDate.getTime())) return false
      return today.toDateString() === deadlineDate.toDateString()
    } catch (error) {
      console.error('Error checking if date is today:', error)
      return false
    }
  }

  const getDaysUntil = (date: string) => {
    try {
      if (!date) return 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadlineDate = new Date(date)
      if (isNaN(deadlineDate.getTime())) return 0
      deadlineDate.setHours(0, 0, 0, 0)
      const diffTime = deadlineDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch (error) {
      console.error('Error calculating days until deadline:', error)
      return 0
    }
  }

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'No date'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  const handleAddDeadline = async () => {
    try {
      // Validate form data
      if (!formData.title.trim()) {
        Alert.alert('Error', 'Please enter a title')
        return
      }
      
      if (!formData.deadline_date.trim()) {
        Alert.alert('Error', 'Please enter a deadline date')
        return
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(formData.deadline_date)) {
        Alert.alert('Error', 'Please enter date in YYYY-MM-DD format')
        return
      }

      // Check if date is valid
      const testDate = new Date(formData.deadline_date)
      if (isNaN(testDate.getTime())) {
        Alert.alert('Error', 'Please enter a valid date')
        return
      }

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
      
      Alert.alert('Success', 'Deadline added successfully')
      loadAllDeadlines()
    } catch (error) {
      console.error('Error adding deadline:', error)
      Alert.alert('Error', 'Failed to add deadline. Please try again.')
    }
  }

  const handleDeadlinePress = (deadline: CalendarDeadline) => {
    if (deadline.calendar_type === 'school' || deadline.calendar_type === 'target') {
      // Navigate to school details
      if (deadline.school_id && navigation) {
        navigation.navigate('SchoolDetails', { schoolId: deadline.school_id })
      } else {
        Alert.alert('Info', 'School details not available')
      }
    } else if (deadline.calendar_type === 'scholarship') {
      // Navigate to scholarship details or show scholarship modal
      Alert.alert(
        deadline.name || deadline.display_title,
        `Provider: ${deadline.provider || 'N/A'}\nAmount: ${deadline.amount || 'N/A'}\nDeadline: ${formatDate(deadline.deadline_date)}`,
        [{ text: 'OK' }]
      )
    } else if (deadline.calendar_type === 'personal') {
      // Show personal deadline details
      Alert.alert(
        deadline.display_title,
        `Type: ${deadline.deadline_type}\nPriority: ${deadline.priority}\nDeadline: ${formatDate(deadline.deadline_date)}${deadline.notes ? `\nNotes: ${deadline.notes}` : ''}`,
        [{ text: 'OK' }]
      )
    }
  }

  if (loading) {
    return (
  <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
  <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
      {/* Calendar Navigation */}
      {renderCalendarHeader()}

      {/* Calendar Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading calendar...</Text>
          </View>
        ) : (
          <>
            {/* Week Headers */}
            {renderWeekHeaders()}
            
            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {getDaysInMonth(currentDate).map((date, index) => 
                renderCalendarDay(date, index)
              )}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <Text style={styles.legendTitle}>Legend</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.legendText}>Application</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
                  <Text style={styles.legendText}>Scholarship</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
                  <Text style={styles.legendText}>Test</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendText}>Interview</Text>
                </View>
              </View>
              
              {!user && (
                <View style={styles.authNote}>
                  <Text style={styles.authNoteText}>
                    📝 Sign in to add and manage your personal deadlines
                  </Text>
                  <Text style={styles.authNoteText}>
                    🏫 School deadlines are visible to everyone
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Calendar</Text>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Show Deadlines</Text>
              
              <View style={styles.filterOption}>
                <Text style={styles.filterLabel}>Personal Deadlines</Text>
                <Switch
                  value={filters.showPersonal}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, showPersonal: value }))}
                  trackColor={{ false: '#f3f4f6', true: '#2563eb' }}
                  thumbColor="#fff"
                />
              </View>
              
              <View style={styles.filterOption}>
                <Text style={styles.filterLabel}>School Deadlines</Text>
                <Switch
                  value={filters.showSchoolDeadlines}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, showSchoolDeadlines: value }))}
                  trackColor={{ false: '#f3f4f6', true: '#2563eb' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setShowFilters(false)
                  loadAllDeadlines()
                }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Details Modal */}
      <Modal visible={showDateDetailsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Selected Date'}
            </Text>
            
            {selectedDate && (
              <ScrollView style={{ maxHeight: 300 }}>
                {getDeadlinesForDate(selectedDate).map((deadline, index) => (
                  <View key={index} style={styles.deadlineItem}>
                    <View style={[styles.deadlineTypeIndicator, { backgroundColor: deadline.color }]} />
                    <View style={styles.deadlineItemContent}>
                      <Text style={styles.deadlineItemTitle}>{deadline.display_title}</Text>
                      <Text style={styles.deadlineItemSubtitle}>
                        {deadline.calendar_type === 'school' ? '🏫 School Deadline' : '📝 Personal Deadline'}
                      </Text>
                    </View>
                  </View>
                ))}
                
                {getDeadlinesForDate(selectedDate).length === 0 && (
                  <Text style={styles.noDeadlinesText}>No deadlines for this date</Text>
                )}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDateDetailsModal(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              
              {user && (
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => {
                    setShowDateDetailsModal(false)
                    if (selectedDate) {
                      setFormData(prev => ({
                        ...prev,
                        deadline_date: selectedDate.toISOString().split('T')[0]
                      }))
                    }
                    setShowAddModal(true)
                  }}
                >
                  <Text style={styles.applyButtonText}>Add Deadline</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Deadline Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Deadline</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={formData.deadline_date}
              onChangeText={(text) => setFormData(prev => ({ ...prev, deadline_date: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Notes (optional)"
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleAddDeadline}
              >
                <Text style={styles.applyButtonText}>Add</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  // Screen header controls moved to navigation header
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Calendar specific styles
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  weekHeaders: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  weekHeader: {
    width: CALENDAR_CELL_SIZE,
    alignItems: 'center',
  },
  weekHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
  },
  calendarDay: {
    width: CALENDAR_CELL_SIZE,
    height: CALENDAR_CELL_SIZE,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    padding: 4,
    justifyContent: 'space-between',
  },
  emptyDay: {
    backgroundColor: '#f9fafb',
  },
  otherMonthDay: {
    backgroundColor: '#f9fafb',
  },
  todayDay: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  otherMonthText: {
    color: '#9ca3af',
  },
  todayText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  deadlineIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  deadlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moreIndicator: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 1,
  },
  legend: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  authNote: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  authNoteText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  
  // Deadline item styles for modal
  deadlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deadlineTypeIndicator: {
    width: 4,
    height: 30,
    borderRadius: 2,
    marginRight: 12,
  },
  deadlineItemContent: {
    flex: 1,
  },
  deadlineItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  deadlineItemSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  noDeadlinesText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    fontStyle: 'italic',
    padding: 20,
  },
  
  // Modal styles
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 16,
    color: '#374151',
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
  applyButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
