"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Building2, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InterviewCountdownProps {
  schoolName: string;
  onCountdownComplete: () => void;
  onSkip: () => void;
}

export default function InterviewCountdown({ schoolName, onCountdownComplete, onSkip }: InterviewCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(3);
  const completedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      onCountdownComplete();
    }
  }, [onCountdownComplete]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, handleComplete]);

  const handleSkip = () => {
    onSkip();
  };

  // Calculate progress percentage for animation
  const progress = ((30 - timeLeft) / 30) * 100

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 z-50 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary))_1px,transparent_0)] bg-[length:50px_50px]" />
      </div>

      <div className="relative z-10 text-center text-slate-800 max-w-lg mx-auto px-6">
        {/* School Context */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 mr-3 text-primary" />
            <span className="text-lg font-medium text-primary">{schoolName}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">AI Interview Starting</h1>
          <p className="text-slate-600 text-lg">Get ready for your conversational interview</p>
        </motion.div>

        {/* Countdown Circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="relative w-48 h-48 mx-auto">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(148,163,184,0.3)"
                strokeWidth="2"
                fill="none"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={283} // 2 * Math.PI * 45
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                transition={{ duration: 0.5 }}
              />
            </svg>

            <AnimatePresence mode="wait">
              <motion.div
                key={timeLeft > 0 ? timeLeft : "start"}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {timeLeft > 0 ? (
                  <span className="text-6xl font-bold text-primary">{timeLeft}</span>
                ) : (
                  <span className="text-4xl font-bold text-primary">Start!</span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Skip Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-primary"
            onClick={handleSkip}
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip Countdown
          </Button>
        </motion.div>
      </div>
    </div>
  );
}