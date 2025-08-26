import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native'

interface NotificationSettings {
  pushNotifications: boolean
  emailDigest: boolean
  deadlineReminders: boolean
  applicationUpdates: boolean
}

interface SwitchItem {
  label: string
  key: keyof NotificationSettings
  type: 'switch'
  description: string
}

interface ActionItem {
  label: string
  type: 'action'
  action: () => void
  description?: string
}

type SettingItem = SwitchItem | ActionItem

interface SettingSection {
  title: string
  items: SettingItem[]
}

export default function SettingsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushNotifications: true,
    emailDigest: true,
    deadlineReminders: true,
    applicationUpdates: false,
  })

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          key: 'pushNotifications' as keyof typeof notifications,
          type: 'switch',
          description: 'Receive push notifications on your device',
        },
        {
          label: 'Email Digest',
          key: 'emailDigest' as keyof typeof notifications,
          type: 'switch',
          description: 'Weekly summary of your application progress',
        },
        {
          label: 'Deadline Reminders',
          key: 'deadlineReminders' as keyof typeof notifications,
          type: 'switch',
          description: 'Get reminded about upcoming deadlines',
        },
        {
          label: 'Application Updates',
          key: 'applicationUpdates' as keyof typeof notifications,
          type: 'switch',
          description: 'Updates about your application status',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Change Password',
          type: 'action',
          action: () => console.log('Change Password'),
        },
        {
          label: 'Privacy Settings',
          type: 'action',
          action: () => console.log('Privacy Settings'),
        },
        {
          label: 'Data Export',
          type: 'action',
          action: () => console.log('Data Export'),
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          label: 'About Nexus',
          type: 'action',
          action: () => console.log('About Nexus'),
        },
        {
          label: 'Terms of Service',
          type: 'action',
          action: () => console.log('Terms of Service'),
        },
        {
          label: 'Privacy Policy',
          type: 'action',
          action: () => console.log('Privacy Policy'),
        },
        {
          label: 'Clear Cache',
          type: 'action',
          action: () => {
            Alert.alert(
              'Clear Cache',
              'Are you sure you want to clear the app cache?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => console.log('Cache cleared') },
              ]
            )
          },
        },
      ],
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your Nexus experience
          </Text>
        </View>

        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.settingItem}>
                <View style={styles.settingItemContent}>
                  <Text style={styles.settingItemLabel}>{item.label}</Text>
                  {'description' in item && item.description && (
                    <Text style={styles.settingItemDescription}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <View style={styles.settingItemControl}>
                  {item.type === 'switch' && 'key' in item && (
                    <Switch
                      value={notifications[item.key]}
                      onValueChange={() => handleNotificationChange(item.key)}
                      trackColor={{ false: '#f3f4f6', true: '#2563eb' }}
                      thumbColor="#fff"
                    />
                  )}
                  {item.type === 'action' && 'action' in item && (
                    <TouchableOpacity onPress={item.action}>
                      <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Nexus v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ for MBA aspirants</Text>
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
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingItemDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingItemControl: {
    marginLeft: 16,
  },
  chevron: {
    fontSize: 20,
    color: '#9ca3af',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
})
