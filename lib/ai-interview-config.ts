// Configuration service for AI Interview system
// Centralizes environment-specific settings and connection URLs

export interface AIInterviewConfig {
  // WebSocket URLs
  localWebSocketUrl: string
  cloudWebSocketUrl: string
  
  // API endpoints
  sessionApiUrl: string
  transcriptApiUrl: string
  evaluationApiUrl: string
  
  // Agent settings
  agentTimeoutMs: number
  reconnectDelayMs: number
  maxReconnectAttempts: number
  
  // Audio settings
  audioSampleRate: number
  audioChannels: number
  audioBufferSize: number
  
  // Session settings
  maxSessionDurationMs: number
  sessionIdLength: number
  
  // Environment
  isDevelopment: boolean
  isProduction: boolean
}

class ConfigService {
  private config: AIInterviewConfig

  constructor() {
    this.config = this.loadConfig()
  }

  private loadConfig(): AIInterviewConfig {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isProduction = process.env.NODE_ENV === 'production'

    return {
      // WebSocket URLs with fallback for different environments
      localWebSocketUrl: process.env.NEXT_PUBLIC_LOCAL_WS_URL || 'ws://localhost:8000/ws',
      cloudWebSocketUrl: process.env.NEXT_PUBLIC_AGENT_WS_URL || 'wss://your-agent-service.a.run.app/ws',
      
      // API endpoints
      sessionApiUrl: '/api/ai-interview-adk/session',
      transcriptApiUrl: '/api/ai-interview-adk/transcript',
      evaluationApiUrl: '/api/ai-interview-adk/evaluation',
      
      // Agent settings
      agentTimeoutMs: parseInt(process.env.NEXT_PUBLIC_AGENT_TIMEOUT_MS || '30000'),
      reconnectDelayMs: parseInt(process.env.NEXT_PUBLIC_RECONNECT_DELAY_MS || '3000'),
      maxReconnectAttempts: parseInt(process.env.NEXT_PUBLIC_MAX_RECONNECT_ATTEMPTS || '5'),
      
      // Audio settings
      audioSampleRate: parseInt(process.env.NEXT_PUBLIC_AUDIO_SAMPLE_RATE || '16000'),
      audioChannels: parseInt(process.env.NEXT_PUBLIC_AUDIO_CHANNELS || '1'),
      audioBufferSize: parseInt(process.env.NEXT_PUBLIC_AUDIO_BUFFER_SIZE || '4096'),
      
      // Session settings
      maxSessionDurationMs: parseInt(process.env.NEXT_PUBLIC_MAX_SESSION_DURATION_MS || '3600000'), // 1 hour
      sessionIdLength: parseInt(process.env.NEXT_PUBLIC_SESSION_ID_LENGTH || '12'),
      
      // Environment
      isDevelopment,
      isProduction
    }
  }

  public getConfig(): AIInterviewConfig {
    return { ...this.config }
  }

  public getWebSocketUrls(): string[] {
    const urls: string[] = []
    
    // In development, try local first
    if (this.config.isDevelopment) {
      urls.push(this.config.localWebSocketUrl)
    }
    
    // Always include cloud URL as fallback
    if (this.config.cloudWebSocketUrl) {
      urls.push(this.config.cloudWebSocketUrl)
    }
    
    return urls
  }

  public getApiUrl(endpoint: 'session' | 'transcript' | 'evaluation'): string {
    switch (endpoint) {
      case 'session':
        return this.config.sessionApiUrl
      case 'transcript':
        return this.config.transcriptApiUrl
      case 'evaluation':
        return this.config.evaluationApiUrl
      default:
        throw new Error(`Unknown API endpoint: ${endpoint}`)
    }
  }

  public generateSessionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < this.config.sessionIdLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required URLs
    if (!this.config.cloudWebSocketUrl) {
      errors.push('Cloud WebSocket URL is not configured')
    }

    // Check numeric values
    if (this.config.agentTimeoutMs <= 0) {
      errors.push('Agent timeout must be positive')
    }

    if (this.config.reconnectDelayMs <= 0) {
      errors.push('Reconnect delay must be positive')
    }

    if (this.config.maxReconnectAttempts <= 0) {
      errors.push('Max reconnect attempts must be positive')
    }

    if (this.config.audioSampleRate <= 0) {
      errors.push('Audio sample rate must be positive')
    }

    if (this.config.sessionIdLength < 8) {
      errors.push('Session ID length must be at least 8 characters')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  public logConfig(): void {
    if (this.config.isDevelopment) {
      console.log('AI Interview Configuration:', {
        ...this.config,
        // Mask sensitive URLs in logs
        localWebSocketUrl: this.config.localWebSocketUrl ? '[SET]' : '[NOT SET]',
        cloudWebSocketUrl: this.config.cloudWebSocketUrl ? '[SET]' : '[NOT SET]'
      })
    }
  }
}

// Singleton instance
const configService = new ConfigService()

// Validate configuration on load
const validation = configService.validateConfig()
if (!validation.isValid) {
  console.warn('AI Interview configuration issues detected:', validation.errors)
}

// Log configuration in development
configService.logConfig()

export { configService }
export default configService
