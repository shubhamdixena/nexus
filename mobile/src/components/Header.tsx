import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import { MenuIcon, BackIcon, SearchIcon, NotificationIcon } from './Icons'

interface HeaderProps {
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
  textColor?: string
}

export default function Header({
  title,
  showBack = false,
  showMenu = true,
  showSearch = false,
  showNotifications = false,
  onBackPress,
  onMenuPress,
  onSearchPress,
  onNotificationPress,
  backgroundColor = '#ffffff',
  textColor = '#1f2937',
}: HeaderProps) {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]} />
      <View style={[styles.header, { backgroundColor }]}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <BackIcon color={textColor} size={24} />
            </TouchableOpacity>
          )}
          {showMenu && !showBack && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onMenuPress}
              activeOpacity={0.7}
            >
              <MenuIcon color={textColor} size={24} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerSection}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {showSearch && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onSearchPress}
              activeOpacity={0.7}
            >
              <SearchIcon color={textColor} size={24} />
            </TouchableOpacity>
          )}
          {showNotifications && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <NotificationIcon color={textColor} size={24} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
})
