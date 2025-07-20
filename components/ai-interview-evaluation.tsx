"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  Clock, 
  MessageSquare, 
  Target,
  Download,
  Share2
} from 'lucide-react'
import { InterviewSession, ConversationTurn } from '@/types/ai-interview'

interface EvaluationMetrics {
  overall_score: number
  communication_score: number
  content_score: number
  confidence_score: number
  clarity_score: number
  response_time_avg: number
  total_duration: number
  total_responses: number
  strengths: string[]
  areas_for_improvement: string[]
  detailed_feedback: {
    category: string
    score: number
    feedback: string
    examples?: string[]
  }[]
}

interface AIInterviewEvaluationProps {
  sessionId: string
  session: InterviewSession
  onRetakeInterview?: () => void
  onShareResults?: () => void
}

export default function AIInterviewEvaluation({
  sessionId,
  session,
  onRetakeInterview,
  onShareResults
}: AIInterviewEvaluationProps) {
  const [evaluation, setEvaluation] = useState<EvaluationMetrics | null>(null)
  const [transcript, setTranscript] = useState<ConversationTurn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    loadEvaluationData()
  }, [sessionId])

  const loadEvaluationData = async () => {
    try {
      setLoading(true)
      
      // Load transcript
      const transcriptResponse = await fetch(`/api/ai-interview-adk/transcript?sessionId=${sessionId}`)
      if (transcriptResponse.ok) {
        const transcriptData = await transcriptResponse.json()
        setTranscript(transcriptData.transcripts || [])
      }

      // Check if evaluation already exists
      const evaluationResponse = await fetch(`/api/ai-interview-adk/evaluation?sessionId=${sessionId}`)
      if (evaluationResponse.ok) {
        const evaluationData = await evaluationResponse.json()
        if (evaluationData.evaluation) {
          setEvaluation(evaluationData.evaluation)
        } else {
          // Generate evaluation if it doesn't exist
          await generateEvaluation()
        }
      } else {
        await generateEvaluation()
      }
    } catch (error) {
      console.error('Failed to load evaluation data:', error)
      setError('Failed to load evaluation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateEvaluation = async () => {
    try {
      setGeneratingReport(true)
      
      const response = await fetch('/api/ai-interview-adk/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sessionData: session
        })
      })

      if (response.ok) {
        const data = await response.json()
        setEvaluation(data.evaluation)
      } else {
        throw new Error('Failed to generate evaluation')
      }
    } catch (error) {
      console.error('Failed to generate evaluation:', error)
      setError('Failed to generate evaluation. Please try again.')
    } finally {
      setGeneratingReport(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  const downloadReport = () => {
    if (!evaluation) return

    const reportContent = `
AI Interview Evaluation Report
============================

Session ID: ${sessionId}
Date: ${new Date(session.started_at || session.created_at).toLocaleDateString()}
Duration: ${session.duration_seconds ? Math.floor(session.duration_seconds / 60) : '0'} minutes

Overall Score: ${evaluation.overall_score}/100

Detailed Scores:
- Communication: ${evaluation.communication_score}/100
- Content Quality: ${evaluation.content_score}/100
- Confidence: ${evaluation.confidence_score}/100
- Clarity: ${evaluation.clarity_score}/100

Strengths:
${evaluation.strengths.map(s => `- ${s}`).join('\n')}

Areas for Improvement:
${evaluation.areas_for_improvement.map(a => `- ${a}`).join('\n')}

Detailed Feedback:
${evaluation.detailed_feedback.map(f => `
${f.category} (${f.score}/100):
${f.feedback}
${f.examples ? f.examples.map(e => `  Example: ${e}`).join('\n') : ''}
`).join('\n')}
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-evaluation-${sessionId.slice(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground">
                {generatingReport ? 'Generating your evaluation report...' : 'Loading evaluation...'}
              </p>
              {generatingReport && (
                <p className="text-sm text-muted-foreground">
                  This may take a few minutes. We're analyzing your interview performance.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={loadEvaluationData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No evaluation data available.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Interview Evaluation</CardTitle>
              <p className="text-muted-foreground">
                Session completed on {new Date(session.started_at || session.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={downloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              {onShareResults && (
                <Button variant="outline" onClick={onShareResults}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              {onRetakeInterview && (
                <Button onClick={onRetakeInterview}>
                  Retake Interview
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Overall Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
              {evaluation.overall_score}
            </div>
            <div className="text-xl text-muted-foreground">out of 100</div>
            <Badge variant={getScoreVariant(evaluation.overall_score)} className="text-lg px-4 py-2">
              {evaluation.overall_score >= 80 ? 'Excellent' : 
               evaluation.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Communication</span>
                  <span className={`font-bold ${getScoreColor(evaluation.communication_score)}`}>
                    {evaluation.communication_score}/100
                  </span>
                </div>
                <Progress value={evaluation.communication_score} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Content Quality</span>
                  <span className={`font-bold ${getScoreColor(evaluation.content_score)}`}>
                    {evaluation.content_score}/100
                  </span>
                </div>
                <Progress value={evaluation.content_score} className="h-2" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Confidence</span>
                  <span className={`font-bold ${getScoreColor(evaluation.confidence_score)}`}>
                    {evaluation.confidence_score}/100
                  </span>
                </div>
                <Progress value={evaluation.confidence_score} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Clarity</span>
                  <span className={`font-bold ${getScoreColor(evaluation.clarity_score)}`}>
                    {evaluation.clarity_score}/100
                  </span>
                </div>
                <Progress value={evaluation.clarity_score} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Session Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">
                {Math.floor((evaluation.total_duration || 0) / 60)}m
              </div>
              <div className="text-sm text-muted-foreground">Total Duration</div>
            </div>
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{evaluation.total_responses}</div>
              <div className="text-sm text-muted-foreground">Responses</div>
            </div>
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">
                {evaluation.response_time_avg ? `${evaluation.response_time_avg.toFixed(1)}s` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{transcript.length}</div>
              <div className="text-sm text-muted-foreground">Total Turns</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback */}
      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feedback">Detailed Feedback</TabsTrigger>
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="improvements">Areas to Improve</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          {evaluation.detailed_feedback.map((feedback, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{feedback.category}</CardTitle>
                  <Badge variant={getScoreVariant(feedback.score)}>
                    {feedback.score}/100
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{feedback.feedback}</p>
                {feedback.examples && (
                  <div>
                    <h4 className="font-medium mb-2">Examples:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {feedback.examples.map((example, i) => (
                        <li key={i}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="strengths">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Your Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {evaluation.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                <span>Areas for Improvement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {evaluation.areas_for_improvement.map((area, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-medium">Recommended Actions:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Review the detailed feedback for each category</li>
                <li>• Practice responses to common interview questions</li>
                <li>• Work on areas identified for improvement</li>
                <li>• Consider retaking the interview to track progress</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Additional Resources:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Interview preparation guides</li>
                <li>• Practice with different school scenarios</li>
                <li>• Mock interview sessions</li>
                <li>• Professional coaching recommendations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
