"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Circle, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Volume2,
  VolumeX 
} from 'lucide-react'
import { 
  InterviewSession, 
  ConversationTurn, 
  TranscriptEntry, 
  ConnectionState, 
  InterviewState, 
  WebSocketMessage 
} from '@/types/ai-interview'

interface AIInterviewSessionProps {
  sessionId: string
  schoolId: string
  schoolName: string
  onSessionComplete?: (session: InterviewSession) => void
  onError?: (error: string) => void
}

export default function AIInterviewSession({
  sessionId,
  schoolId,
  schoolName,
  onSessionComplete,
  onError
}: AIInterviewSessionProps) {
  // Connection and session state
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [interviewState, setInterviewState] = useState<InterviewState>('setup')
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null)
  
  // Audio and UI state
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  
  // Transcript and conversation
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Refs for persistent connections
  const wsRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest transcript entry
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  // Load session on mount or resume
  useEffect(() => {
    loadSession()
  }, [sessionId, schoolId])

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setConnectionState('disconnected')
  }, [])

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/ai-interview-adk/session?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.sessions && data.sessions.length > 0) {
          setCurrentSession(data.sessions[0])
          setInterviewState(data.sessions[0].status === 'completed' ? 'completed' : 'ready')
          await loadTranscript()
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  const loadTranscript = async () => {
    try {
      const response = await fetch(`/api/ai-interview-adk/transcript?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.transcripts) {
          const formattedTranscript: TranscriptEntry[] = data.transcripts.map((turn: ConversationTurn) => ({
            id: `${turn.session_id}-${turn.turn_number}`,
            speaker: turn.speaker,
            text: turn.message_text,
            timestamp: turn.timestamp,
            messageOrder: turn.turn_number,
            ...turn.message_metadata
          }))
          setTranscript(formattedTranscript)
        }
      }
    } catch (error) {
      console.error('Failed to load transcript:', error)
    }
  }

  const connectWebSocket = async () => {
    if (connectionState === 'connecting' || connectionState === 'connected') return

    setConnectionState('connecting')
    setError(null)

    try {
      // Try localhost first, then fallback to cloud
      const wsUrls = [
        'ws://localhost:8000/ws',
        process.env.NEXT_PUBLIC_AGENT_WS_URL || 'wss://your-cloud-run-url.a.run.app/ws'
      ]

      for (const wsUrl of wsUrls) {
        try {
          const ws = new WebSocket(wsUrl)
          
          ws.onopen = () => {
            console.log('WebSocket connected to:', wsUrl)
            wsRef.current = ws
            setConnectionState('connected')
            
            // Send initial setup message
            const setupMessage: WebSocketMessage = {
              type: 'setup',
              sessionId,
              schoolId,
              data: {
                sessionId,
                schoolId,
                userId: 'current-user' // TODO: Get from auth context
              }
            }
            ws.send(JSON.stringify(setupMessage))
          }

          ws.onmessage = (event) => {
            try {
              const message: WebSocketMessage = JSON.parse(event.data)
              handleWebSocketMessage(message)
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error)
            }
          }

          ws.onerror = (error) => {
            console.error('WebSocket error:', error)
            if (wsUrl === wsUrls[wsUrls.length - 1]) {
              setConnectionState('error')
              setError('Failed to connect to interview service. Please try again.')
            }
          }

          ws.onclose = () => {
            console.log('WebSocket disconnected')
            if (wsRef.current === ws) {
              wsRef.current = null
              setConnectionState('disconnected')
              
              // Auto-reconnect if interview is in progress
              if (interviewState === 'in_progress') {
                reconnectTimeoutRef.current = setTimeout(() => {
                  connectWebSocket()
                }, 3000)
              }
            }
          }

          // Wait for connection
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              ws.close()
              reject(new Error('Connection timeout'))
            }, 5000)

            ws.onopen = () => {
              clearTimeout(timeout)
              resolve(undefined)
            }
            ws.onerror = () => {
              clearTimeout(timeout)
              reject(new Error('Connection failed'))
            }
          })

          break // Successfully connected, exit loop
        } catch (error) {
          console.warn(`Failed to connect to ${wsUrl}:`, error)
          if (wsUrl === wsUrls[wsUrls.length - 1]) {
            throw error
          }
        }
      }
    } catch (error) {
      console.error('All WebSocket connection attempts failed:', error)
      setConnectionState('error')
      setError('Unable to connect to the interview service. Please check your connection and try again.')
    }
  }

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'connected':
        setConnectionState('connected')
        break
      
      case 'transcript_update':
        if (message.data) {
          addToTranscript(message.data)
        }
        break
      
      case 'session_update':
        if (message.data) {
          setCurrentSession(message.data)
          setInterviewState(message.data.status)
        }
        break
      
      case 'error':
        setError(message.error || 'An unexpected error occurred')
        onError?.(message.error || 'An unexpected error occurred')
        break
      
      default:
        console.log('Unhandled WebSocket message:', message)
    }
  }

  const addToTranscript = (entry: Partial<TranscriptEntry>) => {
    const newEntry: TranscriptEntry = {
      id: entry.id || `${Date.now()}-${Math.random()}`,
      speaker: entry.speaker || 'agent',
      text: entry.text || '',
      timestamp: entry.timestamp || new Date().toISOString(),
      messageOrder: entry.messageOrder || transcript.length + 1
    }
    
    setTranscript(prev => [...prev, newEntry])
    
    // Save to database
    saveTranscriptEntry(newEntry)
  }

  const saveTranscriptEntry = async (entry: TranscriptEntry) => {
    try {
      await fetch('/api/ai-interview-adk/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          id: entry.id,
          speaker: entry.speaker,
          text: entry.text,
          timestamp: entry.timestamp,
          messageOrder: entry.messageOrder
        })
      })
    } catch (error) {
      console.error('Failed to save transcript entry:', error)
    }
  }

  const startInterview = async () => {
    if (connectionState !== 'connected') {
      await connectWebSocket()
    }
    
    if (connectionState === 'connected') {
      setInterviewState('in_progress')
      await updateSessionStatus('in_progress')
      
      // Start audio capture if enabled
      if (audioEnabled) {
        await startAudioCapture()
      }
    }
  }

  const endInterview = async () => {
    setInterviewState('completed')
    await updateSessionStatus('completed')
    
    // Stop audio capture
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close()
    }
    
    onSessionComplete?.(currentSession!)
  }

  const updateSessionStatus = async (status: InterviewSession['status']) => {
    try {
      const response = await fetch('/api/ai-interview-adk/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          schoolId,
          status,
          startTime: status === 'in_progress' ? new Date().toISOString() : undefined,
          endTime: status === 'completed' ? new Date().toISOString() : undefined
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentSession(data.session)
      }
    } catch (error) {
      console.error('Failed to update session status:', error)
    }
  }

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      streamRef.current = stream
      setIsListening(true)
      
      // TODO: Implement audio processing and transmission to WebSocket
      // This would involve setting up audio context, recording, and sending audio data
      
    } catch (error) {
      console.error('Failed to start audio capture:', error)
      setError('Unable to access microphone. Please check permissions.')
      setAudioEnabled(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted // Will enable if currently muted
      })
    }
  }

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getConnectionStatusIcon = () => {
    switch (connectionState) {
      case 'connected': return <CheckCircle className="h-4 w-4" />
      case 'connecting': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Circle className="h-4 w-4" />
    }
  }

  const formatSpeakerName = (speaker: string) => {
    switch (speaker) {
      case 'user': return 'You'
      case 'agent': return 'Interviewer'
      case 'system': return 'System'
      default: return speaker
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">AI Interview Practice</CardTitle>
              <p className="text-muted-foreground">{schoolName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 ${getConnectionStatusColor()}`}>
                {getConnectionStatusIcon()}
                <span className="text-sm font-medium">
                  {connectionState.charAt(0).toUpperCase() + connectionState.slice(1)}
                </span>
              </div>
              <Badge variant={interviewState === 'completed' ? 'default' : 'secondary'}>
                {interviewState.charAt(0).toUpperCase() + interviewState.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4">
            {interviewState === 'setup' || interviewState === 'ready' ? (
              <Button 
                onClick={startInterview}
                disabled={connectionState === 'connecting'}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <Phone className="h-5 w-5 mr-2" />
                Start Interview
              </Button>
            ) : interviewState === 'in_progress' ? (
              <>
                <Button
                  onClick={toggleMute}
                  variant={isMuted ? "destructive" : "secondary"}
                  size="lg"
                >
                  {isMuted ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  onClick={endInterview}
                  variant="destructive"
                  size="lg"
                >
                  <PhoneOff className="h-5 w-5 mr-2" />
                  End Interview
                </Button>
              </>
            ) : (
              <Button variant="outline" disabled>
                Interview Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full">
            <div className="space-y-4">
              {transcript.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {interviewState === 'setup' || interviewState === 'ready' 
                    ? 'Start the interview to begin the conversation.'
                    : 'Waiting for conversation to start...'
                  }
                </p>
              ) : (
                transcript.map((entry) => (
                  <div key={entry.id} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {formatSpeakerName(entry.speaker)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      entry.speaker === 'user' 
                        ? 'bg-blue-50 ml-0 mr-12' 
                        : 'bg-gray-50 ml-12 mr-0'
                    }`}>
                      {entry.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Status Info */}
      {currentSession && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Session ID</p>
                <p className="font-mono">{currentSession.id.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="text-muted-foreground">Started</p>
                <p>{currentSession.started_at ? new Date(currentSession.started_at).toLocaleString() : 'Not started'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p>{currentSession.duration_seconds ? `${Math.floor(currentSession.duration_seconds / 60)}m ${currentSession.duration_seconds % 60}s` : '--'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Turns</p>
                <p>{currentSession.total_turns || transcript.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
