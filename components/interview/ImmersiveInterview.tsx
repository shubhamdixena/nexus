"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wifi, WifiOff, Building2, Clock, AlertTriangle, Mic, BrainCircuit, BotMessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// A simple, standalone wave animation component
const WaveAnimation = ({ isActive, audioLevel }: { isActive: boolean; audioLevel: number; className: string }) => {
  const waveRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = waveRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    const noise = 0.1;
    let phase = 0;

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 2;
      
      const amplitude = (audioLevel / 100) * (height / 4);
      const frequency = 0.5;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(56, 189, 248, ${0.6 - i * 0.2})`);
        gradient.addColorStop(1, `rgba(167, 139, 250, ${0.6 - i * 0.2})`);
        ctx.strokeStyle = gradient;

        for (let x = 0; x < width; x++) {
          const y = height / 2 + amplitude * Math.sin(x * frequency * 0.01 + phase + i * Math.PI / 3) * (1 + noise * Math.random());
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      phase += 0.05;
      if (isActive) {
        frameId = requestAnimationFrame(draw);
      }
    };

    if (isActive) {
      draw();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isActive, audioLevel]);

  return <canvas ref={waveRef} className="w-full h-full" />;
};


// A simple, standalone pulse indicator component
const PulseIndicator = ({ state, audioLevel }: { state: InterviewState; audioLevel: number }) => {
  const getIndicatorContent = () => {
    switch (state) {
      case 'listening':
        return { icon: Mic, text: "Listening...", color: 'bg-green-500' };
      case 'thinking':
        return { icon: BrainCircuit, text: "Thinking...", color: 'bg-yellow-500' };
      case 'speaking':
        return { icon: BotMessageSquare, text: "Speaking...", color: 'bg-blue-500' };
      default:
        return { icon: Mic, text: "Ready", color: 'bg-gray-500' };
    }
  };

  const { icon: Icon, text, color } = getIndicatorContent();
  const scale = state === 'listening' ? 1 + (audioLevel / 100) * 0.2 : 1;

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <motion.div
        className="relative flex items-center justify-center w-48 h-48 rounded-full"
        animate={{ scale: state === 'thinking' ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.div
          className={`absolute inset-0 rounded-full ${color} opacity-20`}
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`relative flex items-center justify-center w-full h-full rounded-full ${color} shadow-lg`}
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Icon className="w-20 h-20 text-white" />
        </motion.div>
      </motion.div>
      <p className="text-xl text-white/80 font-medium">{text}</p>
    </div>
  );
};


interface ImmersiveInterviewProps {
  schoolId: string;
  schoolName: string;
  onExit: () => void;
}

interface InterviewSession {
  id: string;
  status: 'starting' | 'active' | 'completed' | 'interrupted';
  transcript: TranscriptEntry[];
  startTime: Date;
  endTime?: Date;
}

interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'interviewer';
  text: string;
  timestamp: Date;
  confidence?: number;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';
type InterviewState = 'listening' | 'speaking' | 'thinking' | 'idle';

export default function ImmersiveInterview({ schoolId, schoolName, onExit }: ImmersiveInterviewProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [interviewState, setInterviewState] = useState<InterviewState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [canResume, setCanResume] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const audioProcessorRef = useRef<any>(); // For ScriptProcessorNode

  const cleanup = useCallback(() => {
    console.log('Cleaning up resources...');
    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent reconnect logic
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioProcessorRef.current) {
        audioProcessorRef.current.disconnect();
        audioProcessorRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  // Initialize session
  useEffect(() => {
    const initializeSession = () => {
      try {
        console.log('Initializing session for school:', schoolId);
        
        const existingSession = localStorage.getItem(`interview_session_${schoolId}`);
        if (existingSession) {
          const parsedSession = JSON.parse(existingSession);
          if (parsedSession.status === 'active' && new Date().getTime() - new Date(parsedSession.startTime).getTime() < 24 * 60 * 60 * 1000) {
            console.log('Found existing session:', parsedSession.id);
            setCanResume(true);
            setSession(parsedSession);
            return;
          }
        }

        const newSession: InterviewSession = {
          id: `session_${Date.now()}`,
          status: 'starting',
          transcript: [],
          startTime: new Date()
        };
        
        console.log('Creating new session:', newSession.id);
        setSession(newSession);
        localStorage.setItem(`interview_session_${schoolId}`, JSON.stringify(newSession));
        
      } catch (error) {
        console.error('Failed to initialize session:', error);
        toast({
          title: "Session Error",
          description: "Could not create or retrieve an interview session.",
          variant: "destructive"
        });
        onExit();
      }
    };

    if (schoolId) {
      initializeSession();
    }

    return () => {
      cleanup();
    };
  }, [schoolId, toast, onExit, cleanup]);

  const setupAudioProcessing = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.log("WebSocket not ready for audio processing.");
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        }
      });

      streamRef.current = stream;
      const context = new AudioContext();
      audioContextRef.current = context;
      
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      audioProcessorRef.current = processor;

      analyserRef.current = context.createAnalyser();
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyserRef.current);
      source.connect(processor);
      processor.connect(context.destination);

      processor.onaudioprocess = (e) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const downsampled = downsampleBuffer(inputData, 16000);
          const pcm16 = convertTo16BitPCM(downsampled);
          wsRef.current.send(pcm16.buffer);
        }
      };

      const updateAudioLevel = () => {
        if (analyserRef.current && interviewState === 'listening') {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(Math.min((average / 128) * 100, 100));
        } else {
          setAudioLevel(0);
        }
        if (streamRef.current) { // Continue only if stream is active
            requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
      
    } catch (error) {
      console.error('Audio setup failed:', error);
      setConnectionState('error');
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions and try again.",
        variant: "destructive"
      });
    }
  }, [interviewState, toast]);

  const downsampleBuffer = (buffer: Float32Array, targetSampleRate: number) => {
      if (!audioContextRef.current || targetSampleRate === audioContextRef.current.sampleRate) {
          return buffer;
      }
      const sampleRateRatio = audioContextRef.current.sampleRate / targetSampleRate;
      const newLength = Math.round(buffer.length / sampleRateRatio);
      const result = new Float32Array(newLength);
      let offsetResult = 0;
      let offsetBuffer = 0;
      while (offsetResult < result.length) {
          const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
          let accum = 0, count = 0;
          for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
              accum += buffer[i];
              count++;
          }
          result[offsetResult] = accum / count;
          offsetResult++;
          offsetBuffer = nextOffsetBuffer;
      }
      return result;
  };

  const convertTo16BitPCM = (input: Float32Array) => {
      const buffer = new ArrayBuffer(input.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i]));
          view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
      return new Int16Array(buffer);
  };

  const connectToAgent = useCallback(() => {
    if (!session) {
      console.error('Cannot connect: No session available');
      return;
    }

    setConnectionState('connecting');
    const wsUrl = process.env.NEXT_PUBLIC_AGENT_WS_URL || 'wss://mba-interview-agent-914767009859.us-central1.run.app/ws';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }, 10000);

    ws.onopen = () => {
      clearTimeout(connectionTimeout);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      setConnectionState('connected');
      
      const setupMessage = {
        setup: {
          run_id: `interview_${Date.now()}`,
          user_id: 'current_user', // Replace with actual user ID if available
          context: {
            school_name: schoolName,
            school_id: schoolId,
            interview_type: 'mba_admission',
            session_id: session.id
          }
        }
      };
      ws.send(JSON.stringify(setupMessage));
      
      const activeSession = { ...session, status: 'active' as const };
      setSession(activeSession);
      localStorage.setItem(`interview_session_${schoolId}`, JSON.stringify(activeSession));

      setupAudioProcessing();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleAgentMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      clearTimeout(connectionTimeout);
      setConnectionState('error');
    };

    ws.onclose = (event) => {
      console.log(`WebSocket closed: ${event.code}`);
      clearTimeout(connectionTimeout);
      setConnectionState('disconnected');
      
      if (session?.status === 'active') {
        console.log('Attempting to reconnect in 5 seconds...');
        reconnectTimeoutRef.current = setTimeout(connectToAgent, 5000);
      }
    };
  }, [session, schoolId, schoolName, setupAudioProcessing]);

  const handleAgentMessage = (data: any) => {
    switch (data.type) {
      case 'status':
        setInterviewState(data.state);
        break;
      case 'transcript':
        addToTranscript(data.speaker, data.text, data.confidence);
        break;
      case 'interview_complete':
        handleInterviewComplete();
        break;
      case 'error':
        console.error('Interview error:', data.message);
        toast({
          title: "Interview Error",
          description: data.message,
          variant: "destructive"
        });
        break;
    }
  };

  const addToTranscript = (speaker: 'user' | 'interviewer', text: string, confidence?: number) => {
    if (!session) return;

    const entry: TranscriptEntry = {
      id: `transcript_${Date.now()}`,
      speaker,
      text,
      timestamp: new Date(),
      confidence
    };

    setSession(prev => {
        if (!prev) return null;
        const updatedSession = {
            ...prev,
            transcript: [...prev.transcript, entry]
        };
        localStorage.setItem(`interview_session_${schoolId}`, JSON.stringify(updatedSession));
        return updatedSession;
    });
  };

  const handleInterviewComplete = () => {
    if (!session) return;

    const completedSession = {
      ...session,
      status: 'completed' as const,
      endTime: new Date()
    };

    setSession(completedSession);
    localStorage.removeItem(`interview_session_${schoolId}`);
    
    cleanup();
    
    // You might want to save the session to backend here before redirecting
    router.push('/ai-interview/report-processing');
  };

  const handleExit = () => {
    cleanup();
    onExit();
  };

  const getElapsedTime = () => {
    if (!session?.startTime) return "00:00";
    const elapsed = Math.floor((new Date().getTime() - new Date(session.startTime).getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startInterviewFlow = () => {
    setCanResume(false);
    connectToAgent();
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 overflow-hidden">
      <div className="absolute inset-0">
        <WaveAnimation 
          isActive={connectionState === 'connected' && interviewState !== 'idle'} 
          audioLevel={audioLevel}
          className="w-full h-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-10 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-white/80" />
              <span className="text-sm font-medium text-white/80">{schoolName}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {connectionState === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : connectionState === 'connecting' ? (
                <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-xs text-white/60 capitalize">{connectionState}</span>
            </div>
          </div>

          {session && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-white/60" />
              <span className="text-sm font-mono text-white/60">{getElapsedTime()}</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleExit}
            className="text-white/80 hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      <div className="flex items-center justify-center h-full px-6">
        <AnimatePresence mode="wait">
          {!session ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-white"
            >
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>Initializing session...</p>
            </motion.div>
          ) : canResume ? (
            <motion.div
              key="resume"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-white max-w-md"
            >
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Resume Interview?</h2>
              <p className="text-white/70 mb-6">We found an interrupted interview session. Would you like to continue where you left off?</p>
              <div className="flex gap-4">
                <Button onClick={startInterviewFlow} className="flex-1 bg-white text-black hover:bg-white/90">
                  Resume Interview
                </Button>
                <Button variant="outline" onClick={() => {
                  localStorage.removeItem(`interview_session_${schoolId}`);
                  setCanResume(false);
                  // Re-initialize a fresh session
                  const newSession: InterviewSession = { id: `session_${Date.now()}`, status: 'starting', transcript: [], startTime: new Date() };
                  setSession(newSession);
                  localStorage.setItem(`interview_session_${schoolId}`, JSON.stringify(newSession));
                }} className="flex-1 border-white/30 text-white hover:bg-white/10">
                  Start Fresh
                </Button>
              </div>
            </motion.div>
          ) : connectionState === 'connecting' ? (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-white flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-xl font-medium">Connecting to Agent...</p>
            </motion.div>
          ) : connectionState === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-white max-w-md"
            >
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
              <p className="text-white/70 mb-6">We're having trouble connecting to the interview service. Please check your internet connection.</p>
              <div className="flex gap-4">
                <Button onClick={connectToAgent} className="bg-white text-black hover:bg-white/90">
                  Retry Connection
                </Button>
                <Button variant="outline" onClick={onExit} className="border-white/30 text-white hover:bg-white/10">
                  Back
                </Button>
              </div>
            </motion.div>
          ) : connectionState === 'connected' ? (
            <motion.div
              key="interview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <PulseIndicator 
                state={interviewState}
                audioLevel={audioLevel}
              />
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-white"
            >
              <h2 className="text-3xl font-bold mb-4">Ready to Begin</h2>
              <p className="text-white/70 mb-8">Click start when you're ready for your interview.</p>
              <Button size="lg" onClick={startInterviewFlow} className="bg-white text-black hover:bg-white/90">
                Start Interview
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}