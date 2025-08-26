import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native'

export default function HelpScreen({ navigation }: any) {
  const helpItems = [
    {
      title: 'Getting Started',
      description: 'Learn how to use Nexus effectively',
      action: () => console.log('Getting Started'),
    },
    {
      title: 'Application Process',
      description: 'Understand the MBA application process',
      action: () => console.log('Application Process'),
    },
    {
      title: 'Document Requirements',
      description: 'Learn about required documents',
      action: () => console.log('Document Requirements'),
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      action: () => Linking.openURL('mailto:support@nexus.com'),
    },
    {
      title: 'FAQ',
      description: 'Frequently asked questions',
      action: () => console.log('FAQ'),
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            Get help with your MBA application journey
          </Text>
        </View>

        <View style={styles.section}>
          {helpItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.helpItem}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.helpItemContent}>
                <Text style={styles.helpItemTitle}>{item.title}</Text>
                <Text style={styles.helpItemDescription}>{item.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need more help?</Text>
          <Text style={styles.contactText}>
            Reach out to our support team at{' '}
            <Text 
              style={styles.emailLink}
              onPress={() => Linking.openURL('mailto:support@nexus.com')}
            >
              support@nexus.com
            </Text>
          </Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  chevron: {
    fontSize: 20,
    color: '#9ca3af',
  },
  contactSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  emailLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
})
