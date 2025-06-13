"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '../lib/supabaseClient'
import DataPreloader from '@/lib/data-preloader'
import DashboardPreloader from '@/lib/dashboard-preloader'
import type { User } from '@supabase/supabase-js'

type SupabaseUser = User | null

interface AuthContextType {
  user: SupabaseUser
  loading: boolean
  dataPreloaded: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateProfile: (updates: any) => Promise<{ error: any }>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser>(null)
  const [loading, setLoading] = useState(true)
  const [dataPreloaded, setDataPreloaded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get initial authenticated user
    const getInitialUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error getting user:', error)
        }
        setUser(user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Failed to get initial user:', error)
        setLoading(false)
      }
    }

    getInitialUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email)
          setDataPreloaded(false)
          
          // Start enhanced data preloading in the background
          Promise.all([
            DataPreloader.preloadUserData(session.user),
            DashboardPreloader.smartPreload(session.user.id, window.location.pathname)
          ])
            .then(() => {
              setDataPreloaded(true)
              console.log('✅ Enhanced data preload completed')
            })
            .catch(error => {
              console.error('❌ Data preload failed:', error)
              setDataPreloaded(true) // Set to true anyway to avoid blocking UI
            })
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          setDataPreloaded(false)
          // Clear cached data on logout
          DataPreloader.clearPreloadedData()
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error('Sign in error:', error)
      }
      return { error }
    } catch (error) {
      console.error('Sign in failed:', error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      console.log('Attempting sign up for:', email)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
      if (error) {
        console.error('Sign up error:', error)
      }
      return { error }
    } catch (error) {
      console.error('Sign up failed:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      const { error } = await supabase.auth.updateUser(updates)
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const refreshSession = async () => {
    try {
      await supabase.auth.refreshSession()
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const value = {
    user,
    loading,
    dataPreloaded,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
