import React from 'react'
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'

interface IconProps {
  color: string
  size?: number
  focused?: boolean
}

export function HomeIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="home" size={size} color={color} />
}

export function SchoolIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="school" size={size} color={color} />
}

export function TimelineIcon({ color, size = 24 }: IconProps) {
  return <MaterialIcons name="timeline" size={size} color={color} />
}

export function ApplicationIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="document-text" size={size} color={color} />
}

export function ProfileIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="person" size={size} color={color} />
}

export function ScholarshipIcon({ color, size = 24 }: IconProps) {
  return <MaterialIcons name="school" size={size} color={color} />
}

export function CalendarIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="calendar" size={size} color={color} />
}

export function DocumentsIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="folder" size={size} color={color} />
}

export function ComparisonIcon({ color, size = 24 }: IconProps) {
  return <MaterialIcons name="compare" size={size} color={color} />
}

export function HelpIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="help-circle" size={size} color={color} />
}

export function SettingsIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="settings" size={size} color={color} />
}

export function SignOutIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="log-out" size={size} color={color} />
}

export function MenuIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="menu" size={size} color={color} />
}

export function BackIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="arrow-back" size={size} color={color} />
}

export function SearchIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="search" size={size} color={color} />
}

export function NotificationIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="notifications" size={size} color={color} />
}

export function TargetIcon({ color, size = 24 }: IconProps) {
  return <Ionicons name="flag" size={size} color={color} />
}
