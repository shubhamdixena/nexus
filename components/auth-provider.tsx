"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

type SupabaseUser = User | null

interface AuthContextType {
  user: SupabaseUser
  loading: boolean
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
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Failed to get initial session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle different auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
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
