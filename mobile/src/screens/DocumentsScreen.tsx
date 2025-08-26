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

interface Document {
  id: string
  name: string
  type: 'essay' | 'resume' | 'transcript' | 'letter' | 'other'
  file_url?: string
  file_size?: number
  content?: string
  status: 'draft' | 'review' | 'final'
  created_at: string
  updated_at: string
}

export default function DocumentsScreen() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'essay' as const,
    content: '',
  })

  const loadDocuments = useCallback(async () => {
    try {
      if (!user) return
      
      const data = await apiService.getDocuments()
      setDocuments(data)
    } catch (error) {
      console.error('Error loading documents:', error)
      Alert.alert('Error', 'Failed to load documents')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadDocuments()
  }, [loadDocuments])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'essay':
        return '#3b82f6' // blue
      case 'resume':
        return '#10b981' // green
      case 'transcript':
        return '#f59e0b' // yellow
      case 'letter':
        return '#8b5cf6' // purple
      case 'other':
        return '#6b7280' // gray
      default:
        return '#6b7280'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#6b7280' // gray
      case 'review':
        return '#f59e0b' // yellow
      case 'final':
        return '#10b981' // green
      default:
        return '#6b7280'
    }
  }

  const handleAddDocument = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please enter a document name')
      return
    }

    try {
      await apiService.createDocument({
        ...formData,
        status: 'draft'
      })
      setShowAddModal(false)
      setFormData({
        name: '',
        type: 'essay',
        content: '',
      })
      loadDocuments()
      Alert.alert('Success', 'Document created successfully!')
    } catch (error) {
      console.error('Error adding document:', error)
      Alert.alert('Error', 'Failed to create document')
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteDocument(documentId)
              loadDocuments()
              Alert.alert('Success', 'Document deleted successfully!')
            } catch (error) {
              console.error('Error deleting document:', error)
              Alert.alert('Error', 'Failed to delete document')
            }
          },
        },
      ]
    )
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const groupedDocuments = documents.reduce((groups, doc) => {
    const type = doc.type
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(doc)
    return groups
  }, {} as Record<string, Document[]>)

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading documents...</Text>
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
          <Text style={styles.title}>Documents</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Document Groups */}
        {Object.keys(groupedDocuments).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No documents yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first document to get started
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.primaryButtonText}>Create Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Object.entries(groupedDocuments).map(([type, docs]) => (
            <View key={type} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {type.charAt(0).toUpperCase() + type.slice(1)}s ({docs.length})
              </Text>
              {docs.map((document) => (
                <View key={document.id} style={styles.documentCard}>
                  <View style={styles.documentHeader}>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{document.name}</Text>
                      <Text style={styles.documentMeta}>
                        {new Date(document.updated_at).toLocaleDateString()}
                        {document.file_size && ` • ${formatFileSize(document.file_size)}`}
                      </Text>
                    </View>
                    <View style={styles.badges}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(document.status) }]}>
                        <Text style={styles.badgeText}>{document.status}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {document.content && (
                    <Text style={styles.documentPreview} numberOfLines={2}>
                      {document.content}
                    </Text>
                  )}
                  
                  <View style={styles.documentActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        // TODO: Implement edit functionality
                        Alert.alert('Coming Soon', 'Document editing will be available soon!')
                      }}
                    >
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteDocument(document.id)}
                    >
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Document Modal */}
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
            <Text style={styles.modalTitle}>Create Document</Text>
            <TouchableOpacity onPress={handleAddDocument}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Document Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter document name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeSelector}>
                {['essay', 'resume', 'transcript', 'letter', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      formData.type === type && styles.typeOptionSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type: type as any }))}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      formData.type === type && styles.typeOptionTextSelected
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.content}
                onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
                placeholder="Enter document content"
                multiline
                numberOfLines={8}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
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
  documentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
    marginRight: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 14,
    color: '#64748b',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
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
  documentPreview: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  emptyState: {
    backgroundColor: 'white',
    margin: 20,
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
    height: 120,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  typeOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  typeOptionText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: 'white',
  },
})
