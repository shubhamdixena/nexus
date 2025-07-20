// AI Interview Service
// Handles business logic for AI interview sessions

import { configService } from './ai-interview-config'
import { 
  InterviewSession, 
  ConversationTurn, 
  TranscriptEntry, 
  WebSocketMessage,
  ConnectionState,
  InterviewState 
} from '@/types/ai-interview'

export interface SessionCreateRequest {
  schoolId: string
  userId?: string
}

export interface SessionUpdateRequest {
  sessionId: string
  status?: InterviewSession['status']
  schoolId?: string
  startTime?: string
  endTime?: string
}

export interface TranscriptSaveRequest {
  sessionId: string
  id: string
  speaker: 'user' | 'agent' | 'system'
  text: string
  timestamp: string
  confidence?: number
  messageOrder?: number
}

export interface EvaluationRequest {
  sessionId: string
  sessionData: InterviewSession
}

class AIInterviewService {
  private config = configService.getConfig()

  // Session Management
  async createSession(request: SessionCreateRequest): Promise<InterviewSession> {
    const sessionId = configService.generateSessionId()
    
    const response = await fetch(configService.getApiUrl('session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        schoolId: request.schoolId,
        status: 'pending'
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`)
    }

    const data = await response.json()
    return data.session
  }

  async updateSession(request: SessionUpdateRequest): Promise<InterviewSession> {
    const response = await fetch(configService.getApiUrl('session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.statusText}`)
    }

    const data = await response.json()
    return data.session
  }

  async getSession(sessionId: string): Promise<InterviewSession | null> {
    const response = await fetch(`${configService.getApiUrl('session')}?sessionId=${sessionId}`)
    
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to get session: ${response.statusText}`)
    }

    const data = await response.json()
    return data.sessions?.[0] || null
  }

  async getUserSessions(schoolId?: string): Promise<InterviewSession[]> {
    const url = schoolId 
      ? `${configService.getApiUrl('session')}?schoolId=${schoolId}`
      : configService.getApiUrl('session')
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to get user sessions: ${response.statusText}`)
    }

    const data = await response.json()
    return data.sessions || []
  }

  // Transcript Management
  async saveTranscriptEntry(request: TranscriptSaveRequest): Promise<void> {
    const response = await fetch(configService.getApiUrl('transcript'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Failed to save transcript entry: ${response.statusText}`)
    }
  }

  async getTranscript(sessionId: string): Promise<ConversationTurn[]> {
    const response = await fetch(`${configService.getApiUrl('transcript')}?sessionId=${sessionId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to get transcript: ${response.statusText}`)
    }

    const data = await response.json()
    return data.transcripts || []
  }

  async clearTranscript(sessionId: string): Promise<void> {
    const response = await fetch(`${configService.getApiUrl('transcript')}?sessionId=${sessionId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`Failed to clear transcript: ${response.statusText}`)
    }
  }

  // Transcript format conversion
  transcriptToEntries(transcript: ConversationTurn[]): TranscriptEntry[] {
    return transcript.map(turn => ({
      id: `${turn.session_id}-${turn.turn_number}`,
      speaker: turn.speaker,
      text: turn.message_text,
      timestamp: turn.timestamp,
      messageOrder: turn.turn_number,
      ...turn.message_metadata
    }))
  }

  entryToTranscriptSave(sessionId: string, entry: TranscriptEntry): TranscriptSaveRequest {
    return {
      sessionId,
      id: entry.id,
      speaker: entry.speaker,
      text: entry.text,
      timestamp: entry.timestamp,
      confidence: entry.confidence,
      messageOrder: entry.messageOrder
    }
  }

  // WebSocket Connection Management
  createWebSocketConnection(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const urls = configService.getWebSocketUrls()
      let connectionAttempts = 0
      
      const tryConnection = (urlIndex: number): void => {
        if (urlIndex >= urls.length) {
          reject(new Error('All WebSocket connection attempts failed'))
          return
        }

        const url = urls[urlIndex]
        const ws = new WebSocket(url)
        
        const timeout = setTimeout(() => {
          ws.close()
          tryConnection(urlIndex + 1)
        }, this.config.agentTimeoutMs)

        ws.onopen = () => {
          clearTimeout(timeout)
          console.log(`WebSocket connected to: ${url}`)
          resolve(ws)
        }

        ws.onerror = (error) => {
          clearTimeout(timeout)
          console.warn(`WebSocket connection failed for ${url}:`, error)
          tryConnection(urlIndex + 1)
        }
      }

      tryConnection(0)
    })
  }

  setupWebSocketHandlers(
    ws: WebSocket,
    callbacks: {
      onMessage?: (message: WebSocketMessage) => void
      onError?: (error: string) => void
      onClose?: () => void
      onOpen?: () => void
    }
  ): void {
    ws.onopen = () => {
      console.log('WebSocket connection established')
      callbacks.onOpen?.()
    }

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        callbacks.onMessage?.(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
        callbacks.onError?.('Failed to parse message from server')
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      callbacks.onError?.('WebSocket connection error')
    }

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      callbacks.onClose?.()
    }
  }

  sendWebSocketMessage(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not ready, message not sent:', message)
    }
  }

  // Evaluation Management
  async generateEvaluation(request: EvaluationRequest): Promise<any> {
    const response = await fetch(configService.getApiUrl('evaluation'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Failed to generate evaluation: ${response.statusText}`)
    }

    const data = await response.json()
    return data.evaluation
  }

  async getEvaluation(sessionId: string): Promise<any> {
    const response = await fetch(`${configService.getApiUrl('evaluation')}?sessionId=${sessionId}`)
    
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Failed to get evaluation: ${response.statusText}`)
    }

    const data = await response.json()
    return data.evaluation
  }

  // Utility Methods
  calculateSessionDuration(session: InterviewSession): number {
    if (!session.started_at || !session.completed_at) return 0
    
    const start = new Date(session.started_at).getTime()
    const end = new Date(session.completed_at).getTime()
    return Math.floor((end - start) / 1000) // duration in seconds
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  isSessionExpired(session: InterviewSession): boolean {
    if (!session.started_at) return false
    
    const startTime = new Date(session.started_at).getTime()
    const now = Date.now()
    return (now - startTime) > this.config.maxSessionDurationMs
  }

  canResumeSession(session: InterviewSession): boolean {
    return (
      session.status === 'in_progress' &&
      !this.isSessionExpired(session)
    )
  }

  validateSessionId(sessionId: string): boolean {
    return (
      typeof sessionId === 'string' &&
      sessionId.length >= 8 &&
      /^[A-Za-z0-9]+$/.test(sessionId)
    )
  }

  // Error Handling
  handleApiError(error: any, context: string): Error {
    console.error(`AI Interview Service Error (${context}):`, error)
    
    if (error instanceof Error) {
      return error
    }
    
    if (typeof error === 'string') {
      return new Error(error)
    }
    
    return new Error(`Unknown error occurred in ${context}`)
  }
}

// Singleton instance
const aiInterviewService = new AIInterviewService()

export { aiInterviewService }
export default aiInterviewService
