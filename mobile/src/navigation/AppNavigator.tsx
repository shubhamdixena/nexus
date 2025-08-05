import React from 'react'
import { Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuth } from '../contexts/AuthContext'

// Import screens
import AuthScreen from '../screens/AuthScreen'
import HomeScreen from '../screens/HomeScreen'
import SchoolsScreen from '../screens/SchoolsScreen'
import ScholarshipsScreen from '../screens/ScholarshipsScreen'
import ProfileScreen from '../screens/ProfileScreen'
import SchoolDetailsScreen from '../screens/SchoolDetailsScreen'
import ScholarshipDetailsScreen from '../screens/ScholarshipDetailsScreen'

// Type definitions for navigation
export type RootStackParamList = {
  Auth: undefined
  MainTabs: undefined
  SchoolDetails: { schoolId: string }
  ScholarshipDetails: { scholarshipId: string }
}

export type TabParamList = {
  Home: undefined
  Schools: undefined
  Scholarships: undefined
  Profile: undefined
}

const Stack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Schools" 
        component={SchoolsScreen}
        options={{
          tabBarLabel: 'Schools',
          tabBarIcon: ({ color }) => (
            <SchoolIcon color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Scholarships" 
        component={ScholarshipsScreen}
        options={{
          tabBarLabel: 'Scholarships',
          tabBarIcon: ({ color }) => (
            <ScholarshipIcon color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <ProfileIcon color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

// Simple icon components using emoji
function HomeIcon({ color }: { color: string }) {
  return <Text style={{ color, fontSize: 24 }}>🏠</Text>
}

function SchoolIcon({ color }: { color: string }) {
  return <Text style={{ color, fontSize: 24 }}>🎓</Text>
}

function ScholarshipIcon({ color }: { color: string }) {
  return <Text style={{ color, fontSize: 24 }}>💰</Text>
}

function ProfileIcon({ color }: { color: string }) {
  return <Text style={{ color, fontSize: 24 }}>👤</Text>
}

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    // You can create a proper loading screen component
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="SchoolDetails" 
              component={SchoolDetailsScreen}
              options={{ headerShown: true, title: 'School Details' }}
            />
            <Stack.Screen 
              name="ScholarshipDetails" 
              component={ScholarshipDetailsScreen}
              options={{ headerShown: true, title: 'Scholarship Details' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
