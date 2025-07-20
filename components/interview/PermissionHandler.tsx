"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PermissionHandlerProps {
  onPermissionGranted: () => void
  onPermissionDenied: () => void
}

export default function PermissionHandler({ onPermissionGranted, onPermissionDenied }: PermissionHandlerProps) {
  const [permissionState, setPermissionState] = useState<'unknown' | 'requesting' | 'granted' | 'denied'>('unknown')
  const [error, setError] = useState<string | null>(null)

  const requestMicrophonePermission = async () => {
    setPermissionState('requesting')
    setError(null)

    try {
      // Check if running on desktop (mobile not supported)
      if (window.innerWidth < 1024) {
        setError('AI Interviews are only available on desktop devices')
        setPermissionState('denied')
        return
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })

      // Test that we can access the microphone
      if (stream) {
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop())
        
        setPermissionState('granted')
        onPermissionGranted()
      }
    } catch (error: any) {
      console.error('Microphone permission error:', error)
      
      let errorMessage = 'Failed to access microphone'
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access was denied. Please allow microphone access and refresh the page.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Your browser does not support microphone access.'
      }
      
      setError(errorMessage)
      setPermissionState('denied')
      onPermissionDenied()
    }
  }

  // Auto-check permission on mount
  useEffect(() => {
    const checkExistingPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        
        if (permission.state === 'granted') {
          // Test if we can actually access the microphone
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach(track => track.stop())
            setPermissionState('granted')
            onPermissionGranted()
          } catch {
            // Permission granted but can't access - request again
            setPermissionState('unknown')
          }
        } else if (permission.state === 'denied') {
          setPermissionState('denied')
          setError('Microphone access was previously denied. Please refresh the page and allow access.')
        }
      } catch {
        // Permissions API not supported, request directly
        setPermissionState('unknown')
      }
    }

    checkExistingPermission()
  }, [onPermissionGranted])

  if (permissionState === 'granted') {
    return null // Component disappears once permission is granted
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              animate={permissionState === 'requesting' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mx-auto mb-4"
            >
              {permissionState === 'denied' || error ? (
                <AlertCircle className="w-12 h-12 text-destructive" />
              ) : permissionState === 'requesting' ? (
                <Mic className="w-12 h-12 text-primary animate-pulse" />
              ) : (
                <MicOff className="w-12 h-12 text-muted-foreground" />
              )}
            </motion.div>
            
            <CardTitle className="text-xl">
              {permissionState === 'requesting' 
                ? 'Requesting Microphone Access...'
                : error 
                ? 'Microphone Access Required'
                : 'Enable Microphone'
              }
            </CardTitle>
            
            <CardDescription className="text-center">
              {error ? error : 'We need access to your microphone for the conversational interview experience.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {!error && permissionState !== 'requesting' && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Make sure you're in a quiet environment</p>
                <p>• Use headphones for best audio quality</p>
                <p>• Desktop devices only (mobile not supported)</p>
              </div>
            )}
            
            <div className="flex gap-3">
              {permissionState === 'denied' || error ? (
                <Button 
                  onClick={() => window.location.reload()} 
                  className="flex-1"
                  variant="outline"
                >
                  Refresh Page
                </Button>
              ) : (
                <Button 
                  onClick={requestMicrophonePermission} 
                  disabled={permissionState === 'requesting'}
                  className="flex-1"
                >
                  {permissionState === 'requesting' ? (
                    <>
                      <Mic className="w-4 h-4 mr-2 animate-pulse" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Allow Microphone
                    </>
                  )}
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 