import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { apiService } from '../services/api'

interface MBASchool {
  id: string
  business_school: string
  location: string
  country: string
  qs_mba_rank?: number
  tuition_total?: string
}

export default function SchoolsScreen() {
  const navigation = useNavigation()
  const [schools, setSchools] = useState<MBASchool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadSchools()
  }, [])

  const loadSchools = async () => {
    try {
      const response = await apiService.getMBASchools({
        page: 1,
        limit: 20,
        search: searchQuery,
      })
      setSchools(response.data || [])
    } catch (error) {
      console.error('Error loading schools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    setPage(1)
    loadSchools()
  }

  const handleSchoolPress = (school: MBASchool) => {
    // Navigate to school details
    // navigation.navigate('SchoolDetails', { schoolId: school.id })
    console.log('School pressed:', school.business_school)
  }

  const renderSchool = ({ item }: { item: MBASchool }) => (
    <TouchableOpacity
      style={styles.schoolCard}
      onPress={() => handleSchoolPress(item)}
    >
      <View style={styles.schoolHeader}>
        <Text style={styles.schoolName} numberOfLines={2}>
          {item.business_school}
        </Text>
        {item.qs_mba_rank && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{item.qs_mba_rank}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.schoolLocation}>
        📍 {item.location}, {item.country}
      </Text>
      
      {item.tuition_total && (
        <Text style={styles.tuition}>
          💰 {item.tuition_total}
        </Text>
      )}
    </TouchableOpacity>
  )

  if (loading && schools.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading schools...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MBA Schools</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search schools..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Schools List */}
      <FlatList
        data={schools}
        renderItem={renderSchool}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  searchButtonText: {
    fontSize: 16,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  schoolCard: {
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
  schoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  rankBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  schoolLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  tuition: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
})
