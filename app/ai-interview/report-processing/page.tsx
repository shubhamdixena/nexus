"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, FileText, Brain, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function ReportProcessingPage() {
  const [timeRemaining, setTimeRemaining] = useState(10 * 60) // 10 minutes in seconds
  const [processingStage, setProcessingStage] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const stages = [
    { name: "Processing Interview Transcript", description: "Analyzing conversation flow and content", duration: 120 },
    { name: "Evaluating Communication Skills", description: "Assessing clarity, confidence, and articulation", duration: 180 },
    { name: "Analyzing Answer Quality", description: "Reviewing responses to behavioral questions", duration: 180 },
    { name: "Generating Insights", description: "Creating personalized feedback and recommendations", duration: 120 }
  ]

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Redirect to reports page when done
          router.push('/reports')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, router])

  // Processing stage progression
  useEffect(() => {
    const totalDuration = 10 * 60 // 10 minutes
    const elapsed = totalDuration - timeRemaining
    
    let cumulativeTime = 0
    let currentStage = 0
    
    for (let i = 0; i < stages.length; i++) {
      cumulativeTime += stages[i].duration
      if (elapsed < cumulativeTime) {
        currentStage = i
        break
      }
      currentStage = i + 1
    }
    
    setProcessingStage(Math.min(currentStage, stages.length - 1))
  }, [timeRemaining])

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progressPercentage = ((10 * 60 - timeRemaining) / (10 * 60)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "easeInOut"
            }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Interview Complete! 🎉
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Your AI Interview Analysis is Being Generated
          </p>
          <p className="text-slate-500">
            Our AI is carefully analyzing your performance and preparing detailed insights
          </p>
        </motion.div>

        {/* Main Processing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-2 border-blue-100 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                <Clock className="w-6 h-6 text-blue-500" />
                Report Ready In
              </CardTitle>
              <motion.div
                key={timeRemaining}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-5xl font-bold text-blue-600 mt-2"
              >
                {formatTime(timeRemaining)}
              </motion.div>
              <CardDescription className="text-lg mt-2">
                We'll notify you via email when your detailed report is ready
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Processing Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-3 bg-slate-200"
                />
              </div>

              {/* Processing Stages */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700 mb-4">Current Analysis Stage:</h3>
                
                {stages.map((stage, index) => {
                  const isCompleted = index < processingStage
                  const isCurrent = index === processingStage
                  const isUpcoming = index > processingStage

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200' 
                          : isCurrent 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500' 
                          : isCurrent 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'bg-slate-300 border-slate-300'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : isCurrent ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <div className="w-2 h-2 bg-slate-500 rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-slate-500'
                        }`}>
                          {stage.name}
                        </h4>
                        <p className={`text-sm ${
                          isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-slate-400'
                        }`}>
                          {stage.description}
                        </p>
                      </div>

                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* What to Expect */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  What You'll Receive
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Detailed Performance Analysis:</strong> Comprehensive evaluation of your communication skills, answer quality, and interview presence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Personalized Recommendations:</strong> Specific suggestions to improve your interview performance for future applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Benchmarking Insights:</strong> How your performance compares to other candidates for similar programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span><strong>Interview Transcript:</strong> Complete conversation record with key moments highlighted</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <Button 
            variant="outline" 
            asChild
            className="flex items-center gap-2"
          >
            <Link href="/applications">
              <ArrowLeft className="w-4 h-4" />
              Back to Applications
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              // Send notification email
              toast({
                title: "Notification Set",
                description: "We'll email you when your report is ready",
              })
            }}
          >
            <Mail className="w-4 h-4" />
            Email Reminder
          </Button>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-sm text-slate-500"
        >
          <p>Your report will be available in your dashboard and sent to your email address.</p>
          <p className="mt-1">Processing typically completes in 8-12 minutes.</p>
        </motion.div>
      </div>
    </div>
  )
} 