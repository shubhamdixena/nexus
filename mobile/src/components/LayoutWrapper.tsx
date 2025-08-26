import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Header from './Header'

interface LayoutWrapperProps {
  children: React.ReactNode
  title: string
  showBack?: boolean
  showMenu?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  onBackPress?: () => void
  onMenuPress?: () => void
  onSearchPress?: () => void
  onNotificationPress?: () => void
  backgroundColor?: string
  headerBackgroundColor?: string
}

export default function LayoutWrapper({
  children,
  title,
  showBack = false,
  showMenu = true,
  showSearch = false,
  showNotifications = false,
  onBackPress,
  onMenuPress,
  onSearchPress,
  onNotificationPress,
  backgroundColor = '#f8fafc',
  headerBackgroundColor = '#ffffff',
}: LayoutWrapperProps) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <Header
          title={title}
          showBack={showBack}
          showMenu={showMenu}
          showSearch={showSearch}
          showNotifications={showNotifications}
          onBackPress={onBackPress}
          onMenuPress={onMenuPress}
          onSearchPress={onSearchPress}
          onNotificationPress={onNotificationPress}
          backgroundColor={headerBackgroundColor}
        />
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})
