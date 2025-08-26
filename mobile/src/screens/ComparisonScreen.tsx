import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'

interface School {
  id: string
  business_school: string
  location: string
  country: string
  tuition_fees?: number
  living_expenses?: number
  duration_months?: number
  ranking_qs?: number
  ranking_ft?: number
  acceptance_rate?: number
  gmat_average?: number
  gre_average?: number
  employment_rate?: number
  average_salary?: number
  application_deadline?: string
  program_type?: string
  specializations?: string[]
}

export default function ComparisonScreen() {
  const { user } = useAuth()
  const [schools, setSchools] = useState<School[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<School[]>([])
  const [loading, setLoading] = useState(false)

  const searchSchools = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const results = await apiService.searchSchools(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching schools:', error)
      Alert.alert('Error', 'Failed to search schools')
    } finally {
      setLoading(false)
    }
  }, [])

  const addSchoolToComparison = (school: School) => {
    if (schools.find(s => s.id === school.id)) {
      Alert.alert('Already Added', 'This school is already in your comparison')
      return
    }
    
    if (schools.length >= 3) {
      Alert.alert('Limit Reached', 'You can compare up to 3 schools at a time')
      return
    }

    setSchools(prev => [...prev, school])
    setSearchQuery('')
    setSearchResults([])
  }

  const removeSchoolFromComparison = (schoolId: string) => {
    setSchools(prev => prev.filter(s => s.id !== schoolId))
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value?: number) => {
    if (!value) return 'N/A'
    return `${value}%`
  }

  const comparisonMetrics = [
    { key: 'tuition_fees', label: 'Tuition Fees', format: formatCurrency },
    { key: 'living_expenses', label: 'Living Expenses', format: formatCurrency },
    { key: 'duration_months', label: 'Duration (Months)', format: (val?: number) => val?.toString() || 'N/A' },
    { key: 'ranking_qs', label: 'QS Ranking', format: (val?: number) => val?.toString() || 'N/A' },
    { key: 'ranking_ft', label: 'FT Ranking', format: (val?: number) => val?.toString() || 'N/A' },
    { key: 'acceptance_rate', label: 'Acceptance Rate', format: formatPercentage },
    { key: 'gmat_average', label: 'Average GMAT', format: (val?: number) => val?.toString() || 'N/A' },
    { key: 'gre_average', label: 'Average GRE', format: (val?: number) => val?.toString() || 'N/A' },
    { key: 'employment_rate', label: 'Employment Rate', format: formatPercentage },
    { key: 'average_salary', label: 'Average Salary', format: formatCurrency },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>School Comparison</Text>
        <Text style={styles.subtitle}>Compare up to 3 schools side by side</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text)
            searchSchools(text)
          }}
          placeholder="Search for schools to compare..."
          autoCapitalize="none"
        />
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <ScrollView style={styles.searchResultsList}>
            {searchResults.map((school) => (
              <TouchableOpacity
                key={school.id}
                style={styles.searchResultItem}
                onPress={() => addSchoolToComparison(school)}
              >
                <View>
                  <Text style={styles.searchResultName}>{school.business_school}</Text>
                  <Text style={styles.searchResultLocation}>
                    {school.location}, {school.country}
                  </Text>
                </View>
                <Text style={styles.addButton}>Add</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Comparison Table */}
      {schools.length > 0 ? (
        <ScrollView style={styles.comparisonContainer}>
          {/* School Headers */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.comparisonTable}>
              <View style={styles.headerRow}>
                <View style={[styles.cell, styles.metricCell]}>
                  <Text style={styles.metricLabel}>School</Text>
                </View>
                {schools.map((school) => (
                  <View key={school.id} style={[styles.cell, styles.schoolCell]}>
                    <Text style={styles.schoolName} numberOfLines={2}>
                      {school.business_school}
                    </Text>
                    <Text style={styles.schoolLocation} numberOfLines={1}>
                      {school.location}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeSchoolFromComparison(school.id)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Comparison Rows */}
              {comparisonMetrics.map((metric) => (
                <View key={metric.key} style={styles.comparisonRow}>
                  <View style={[styles.cell, styles.metricCell]}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                  </View>
                  {schools.map((school) => (
                    <View key={school.id} style={[styles.cell, styles.valueCell]}>
                      <Text style={styles.valueText}>
                        {metric.format((school as any)[metric.key])}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No schools selected</Text>
          <Text style={styles.emptySubtext}>
            Search and add schools above to start comparing
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  searchResults: {
    backgroundColor: 'white',
    maxHeight: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  searchResultLocation: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  addButton: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  comparisonContainer: {
    flex: 1,
    padding: 20,
  },
  comparisonTable: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  metricCell: {
    width: 150,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  schoolCell: {
    width: 200,
    alignItems: 'center',
  },
  valueCell: {
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  schoolName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  schoolLocation: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  valueText: {
    fontSize: 14,
    color: '#1e293b',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    lineHeight: 20,
  },
})
