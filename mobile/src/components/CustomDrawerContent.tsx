import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer'
import { useAuth } from '../contexts/AuthContext'
import { 
  HomeIcon, 
  SchoolIcon, 
  ScholarshipIcon, 
  TimelineIcon, 
  CalendarIcon, 
  ApplicationIcon, 
  DocumentsIcon, 
  ComparisonIcon, 
  HelpIcon, 
  SettingsIcon, 
  SignOutIcon,
  TargetIcon
} from './Icons'

interface DrawerItem {
  label: string
  icon: React.ComponentType<{ color: string; size?: number }>
  onPress: () => void
  isDivider?: boolean
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, signOut } = useAuth()
  const { navigation } = props

  const drawerItems: DrawerItem[] = [
    {
      label: 'Home',
      icon: HomeIcon,
      onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }),
    },
    {
      label: 'Schools',
      icon: SchoolIcon,
      onPress: () => navigation.navigate('MainTabs', { screen: 'Schools' }),
    },
    {
      label: 'Target Schools',
      icon: TargetIcon,
      onPress: () => navigation.navigate('MainTabs', { screen: 'Targets' }),
    },
    {
      label: 'Applications',
      icon: ApplicationIcon,
      onPress: () => navigation.navigate('MainTabs', { screen: 'Applications' }),
    },
    {
      label: 'Timeline',
      icon: TimelineIcon,
      onPress: () => navigation.navigate('Timeline'),
    },
    {
      label: 'Scholarships',
      icon: ScholarshipIcon,
      onPress: () => navigation.navigate('Scholarships'),
    },
    {
      label: 'Calendar',
      icon: CalendarIcon,
      onPress: () => navigation.navigate('Calendar'),
    },
    {
      label: 'Documents',
      icon: DocumentsIcon,
      onPress: () => navigation.navigate('Documents'),
    },
    {
      label: 'Comparison',
      icon: ComparisonIcon,
      onPress: () => navigation.navigate('Comparison'),
    },
    {
      label: '',
      icon: HomeIcon, // Dummy icon for divider
      onPress: () => {},
      isDivider: true,
    },
    {
      label: 'Help & Support',
      icon: HelpIcon,
      onPress: () => {
        navigation.navigate('Help')
      },
    },
    {
      label: 'Settings',
      icon: SettingsIcon,
      onPress: () => {
        navigation.navigate('Settings')
      },
    },
    {
      label: 'Sign Out',
      icon: SignOutIcon,
      onPress: () => signOut(),
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>Welcome!</Text>
            <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
              {user?.email || 'User'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.drawerContent}
        contentContainerStyle={styles.drawerContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {drawerItems.map((item, index) => {
          if (item.isDivider) {
            return <View key={index} style={styles.divider} />
          }

          const IconComponent = item.icon

          return (
            <TouchableOpacity
              key={index}
              style={styles.drawerItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.drawerItemIcon}>
                <IconComponent color="#4b5563" size={20} />
              </View>
              <Text style={styles.drawerItemLabel} numberOfLines={1} ellipsizeMode="tail">
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Nexus v1.0.0</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    backgroundColor: '#0a66c2',
    borderBottomWidth: 1,
    borderBottomColor: '#084489',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0a66c2',
  },
  userDetails: {
    flex: 1,
    minWidth: 0, // Prevents overflow
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#b6d0f0',
  },
  drawerContent: {
    flex: 1,
  },
  drawerContentContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  drawerItemIcon: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  drawerItemLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1, // Prevents overflow
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
})
