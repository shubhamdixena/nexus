"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  CreditCard, 
  Settings, 
  BarChart3, 
  FileText, 
  Play, 
  Pause, 
  Download,
  Menu,
  X,
  Wifi,
  Monitor,
  Volume2,
  Eye,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Brain,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  School,
  GraduationCap,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  Target,
  BookOpen,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'

// Particle Animation Component
const ParticleField = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return <canvas ref={canvasRef} className={`absolute inset-0 ${className}`} />
}

// Main Platform Component
const AIInterviewPlatform = () => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState('dashboard') // Default to dashboard since user is authenticated
  const [isRecording, setIsRecording] = useState(false)
  const [interviewTime, setInterviewTime] = useState(0)
  const [systemChecks, setSystemChecks] = useState({
    camera: false,
    microphone: false,
    internet: false,
    browser: false
  })
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    targetSchool: '',
    program: '',
    experience: '',
    cv: null as File | null,
    motivation: '',
    goals: '',
    background: ''
  })

  // Timer effect for interview
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentPage === 'interview' && isRecording) {
      interval = setInterval(() => {
        setInterviewTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentPage, isRecording])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Brain className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading AI Interview Platform...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Landing Page
  const LandingPage = () => (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">InterviewAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <Button variant="outline" onClick={() => setCurrentPage('login')}>Login</Button>
              <Button onClick={() => setCurrentPage('signup')}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <ParticleField className="opacity-30" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            >
              Master Your MBA Interview with{' '}
              <span className="text-primary">AI-Powered Practice</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Get personalized interview practice for your target MBA program. Receive detailed feedback and improve your performance with our advanced AI interviewer.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" onClick={() => setCurrentPage('signup')} className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" onClick={() => setCurrentPage('demo')} className="text-lg px-8 py-3">
                Watch Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose InterviewAI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with MBA-specific interview expertise
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Interviews",
                description: "Advanced AI that adapts to your responses and provides realistic interview scenarios"
              },
              {
                icon: FileText,
                title: "Detailed Reports",
                description: "Get comprehensive PDF reports with personalized feedback and improvement suggestions"
              },
              {
                icon: Target,
                title: "School-Specific Prep",
                description: "Tailored questions and scenarios based on your target MBA program"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your interview preparation needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Basic",
                price: "$29",
                features: ["1 Interview Session", "Basic Report", "Email Support"],
                popular: false
              },
              {
                name: "Pro",
                price: "$79",
                features: ["3 Interview Sessions", "Detailed Reports", "Priority Support", "School-Specific Prep"],
                popular: true
              },
              {
                name: "Premium",
                price: "$149",
                features: ["Unlimited Sessions", "Advanced Analytics", "1-on-1 Coaching", "All Features"],
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => setCurrentPage('payment')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )

  // Signup/Login Pages
  const AuthPage = ({ type }: { type: 'login' | 'signup' }) => (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">InterviewAI</span>
            </div>
            <CardTitle>{type === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>
              {type === 'login' ? 'Sign in to your account' : 'Start your interview preparation journey'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {type === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full" onClick={() => setCurrentPage('dashboard')}>
              {type === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setCurrentPage(type === 'login' ? 'signup' : 'login')}
              >
                {type === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Dashboard
  const Dashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">InterviewAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/'} className="hover:bg-primary/10">
                <Target className="mr-2 h-4 w-4" />
                Back to Nexus
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage('ai-settings')} className="hover:bg-primary/10">
                <Settings className="mr-2 h-4 w-4" />
                AI Settings
              </Button>
              <Avatar className="ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden">
        <ParticleField className="opacity-10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Welcome back, <span className="text-primary">John!</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">Ready to ace your next MBA interview?</p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-4 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-3"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">All systems operational</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-4 gap-6 mb-12"
          >
            {[
              { 
                title: "Interviews Completed", 
                value: "12", 
                change: "+3 this week", 
                icon: MessageSquare, 
                color: "text-blue-500",
                bgColor: "bg-blue-500/10"
              },
              { 
                title: "Average Score", 
                value: "8.7/10", 
                change: "+0.8 improvement", 
                icon: TrendingUp, 
                color: "text-green-500",
                bgColor: "bg-green-500/10"
              },
              { 
                title: "Time Practiced", 
                value: "6.5h", 
                change: "This month", 
                icon: Clock, 
                color: "text-purple-500",
                bgColor: "bg-purple-500/10"
              },
              { 
                title: "Success Rate", 
                value: "94%", 
                change: "+12% vs last month", 
                icon: Target, 
                color: "text-orange-500",
                bgColor: "bg-orange-500/10"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group"
              >
                <Card className="border-0 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Action Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Start Interview Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2"
            >
              <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Ready for Your Next Interview?</h3>
                      <p className="text-muted-foreground">Start a personalized MBA interview session with our AI interviewer</p>
                    </div>
                    <div className="hidden md:block">
                      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Brain className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button 
                      size="lg"
                      onClick={() => setCurrentPage('interview-setup')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Start New Interview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setCurrentPage('system-check')}
                      className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:scale-105 transition-all duration-300"
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      System Check
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-0 bg-background/60 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Your Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Interview Skills</span>
                      <span className="text-sm text-muted-foreground">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Communication</span>
                      <span className="text-sm text-muted-foreground">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Confidence</span>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Next milestone</p>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Complete 15 interviews</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">3 more to go!</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Recent Interview Reports</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { 
                      date: "Jan 15, 2024", 
                      school: "Harvard Business School", 
                      score: 8.9, 
                      duration: "42 min",
                      status: "Excellent"
                    },
                    { 
                      date: "Jan 12, 2024", 
                      school: "Stanford GSB", 
                      score: 8.5, 
                      duration: "38 min",
                      status: "Very Good"
                    },
                    { 
                      date: "Jan 10, 2024", 
                      school: "Wharton School", 
                      score: 8.7, 
                      duration: "45 min",
                      status: "Excellent"
                    }
                  ].map((report, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="group cursor-pointer"
                    >
                      <Card className="border-0 bg-muted/30 hover:bg-muted/50 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                                {report.school}
                              </h4>
                              <p className="text-xs text-muted-foreground">{report.date}</p>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`${report.score >= 8.5 ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700'}`}
                            >
                              {report.score}/10
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{report.duration}</span>
                            <div className="flex items-center space-x-1">
                              <Download className="h-3 w-3" />
                              <span>PDF</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )

  // Quick Interview Prep (simplified since user is already authenticated)
  const InterviewPrep = () => (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">InterviewAI</span>
            </div>
            <Button variant="outline" onClick={() => setCurrentPage('dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Ready to Start Your Interview?</h1>
            <p className="text-muted-foreground">
              Welcome {user?.user_metadata?.full_name || user?.email}! Let's prepare for your MBA interview.
            </p>
          </div>

          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">AI Interview Practice</h3>
                <p className="text-muted-foreground">
                  Experience a realistic MBA interview with our AI interviewer. Get instant feedback and improve your performance.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">What to Expect:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 8 common MBA interview questions</li>
                    <li>• AI-powered conversation</li>
                    <li>• Real-time feedback</li>
                    <li>• 30-40 minute session</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">Tips for Success:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Speak clearly and confidently</li>
                    <li>• Use specific examples</li>
                    <li>• Be authentic and genuine</li>
                    <li>• Take your time to think</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage('dashboard')}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button 
                  onClick={() => setCurrentPage('system-check')}
                  className="flex-1"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Interview Prep
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // System Check Page
  const SystemCheck = () => {
    const [checking, setChecking] = useState(false)
    const [currentCheck, setCurrentCheck] = useState('')

    const runSystemCheck = async () => {
      setChecking(true)
      const checks = ['camera', 'microphone', 'internet', 'browser']
      
      for (const check of checks) {
        setCurrentCheck(check)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setSystemChecks(prev => ({ ...prev, [check]: true }))
      }
      
      setChecking(false)
      setCurrentCheck('')
    }

    const allChecksPassed = Object.values(systemChecks).every(Boolean)

    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">InterviewAI</span>
              </div>
              <Button variant="outline" onClick={() => setCurrentPage('interview-setup')}>
                Back to Prep
              </Button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">System Check</h1>
              <p className="text-muted-foreground">
                Let's make sure everything is working properly before your interview
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {[
                    { key: 'camera', icon: Camera, label: 'Camera Access', description: 'We need access to your camera for the video interview' },
                    { key: 'microphone', icon: Mic, label: 'Microphone Access', description: 'We need access to your microphone to hear your responses' },
                    { key: 'internet', icon: Wifi, label: 'Internet Connection', description: 'Checking your internet connection stability' },
                    { key: 'browser', icon: Monitor, label: 'Browser Compatibility', description: 'Verifying your browser supports all required features' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                      <item.icon className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center">
                        {checking && currentCheck === item.key ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        ) : systemChecks[item.key as keyof typeof systemChecks] ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-4">
                  {!checking && !allChecksPassed && (
                    <Button onClick={runSystemCheck} className="w-full" size="lg">
                      <Settings className="mr-2 h-4 w-4" />
                      Run System Check
                    </Button>
                  )}
                  
                  {allChecksPassed && (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          All system checks passed! You're ready to start your interview.
                        </AlertDescription>
                      </Alert>
                      <Button 
                        onClick={() => setCurrentPage('interview')} 
                        className="w-full" 
                        size="lg"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Interview
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Animated AI Avatar Component
  const AnimatedAIAvatar = ({ isListening = false, isSpeaking = false }) => {
    return (
      <div className="relative">
        {/* Main Avatar Circle */}
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.05, 1] : isListening ? [1, 1.02, 1] : 1,
            boxShadow: isSpeaking 
              ? ["0 0 0 0 rgba(99, 102, 241, 0.4)", "0 0 0 20px rgba(99, 102, 241, 0)", "0 0 0 0 rgba(99, 102, 241, 0)"]
              : isListening
              ? ["0 0 0 0 rgba(34, 197, 94, 0.4)", "0 0 0 15px rgba(34, 197, 94, 0)", "0 0 0 0 rgba(34, 197, 94, 0)"]
              : "0 0 0 0 rgba(99, 102, 241, 0.1)"
          }}
          transition={{
            duration: isSpeaking ? 1.5 : isListening ? 2 : 3,
            repeat: (isSpeaking || isListening) ? Infinity : 0,
            ease: "easeInOut"
          }}
          className="w-48 h-48 bg-gradient-to-br from-primary/20 via-primary/30 to-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30"
        >
          {/* Inner Avatar */}
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: isSpeaking ? [1, 1.1, 1] : 1
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center"
          >
            <Brain className="h-16 w-16 text-white" />
          </motion.div>
        </motion.div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/40 rounded-full"
            animate={{
              x: [0, Math.cos(i * 60 * Math.PI / 180) * 80, 0],
              y: [0, Math.sin(i * 60 * Math.PI / 180) * 80, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}

        {/* Status Indicator */}
        <motion.div
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border ${
            isSpeaking 
              ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' 
              : isListening 
              ? 'bg-green-500/20 border-green-500/30 text-green-300'
              : 'bg-primary/20 border-primary/30 text-primary'
          }`}>
            {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready'}
          </div>
        </motion.div>
      </div>
    )
  }

  // Interview Page
  const InterviewPage = () => {
    const [currentQuestion, setCurrentQuestion] = useState(1)
    const [aiState, setAiState] = useState('speaking') // 'speaking', 'listening', 'ready'
    const [showQuestion, setShowQuestion] = useState(true)
    
    const questions = [
      "Tell me about yourself and your background.",
      "Why do you want to pursue an MBA?",
      "Why are you interested in our school specifically?",
      "Describe a challenging situation you faced at work and how you handled it.",
      "Where do you see yourself in 5 years?",
      "What would you contribute to our MBA program?",
      "Tell me about a time you demonstrated leadership.",
      "How do you handle failure or setbacks?"
    ]

    // Auto-start interview
    useEffect(() => {
      setIsRecording(true)
      // Simulate AI speaking then listening cycle
      const interval = setInterval(() => {
        setAiState(prev => {
          if (prev === 'speaking') return 'listening'
          if (prev === 'listening') return 'ready'
          return 'speaking'
        })
      }, 8000)

      return () => clearInterval(interval)
    }, [])

    // Auto-advance questions
    useEffect(() => {
      const questionTimer = setTimeout(() => {
        if (currentQuestion < questions.length) {
          setCurrentQuestion(prev => prev + 1)
          setAiState('speaking')
          setShowQuestion(true)
        } else {
          // Interview complete
          setCurrentPage('dashboard')
        }
      }, 45000) // 45 seconds per question

      return () => clearTimeout(questionTimer)
    }, [currentQuestion])

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <ParticleField className="opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Minimal Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 z-50 p-6"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="font-medium">InterviewAI</span>
              </div>
              <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Clock className="h-4 w-4 text-green-400" />
                <span className="text-sm font-mono">{formatTime(interviewTime)}</span>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setCurrentPage('dashboard')}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 backdrop-blur-sm"
            >
              End Interview
            </Button>
          </div>
        </motion.div>

        {/* Main Interview Area */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
          {/* AI Interviewer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <AnimatedAIAvatar 
              isListening={aiState === 'listening'} 
              isSpeaking={aiState === 'speaking'} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Dr. Sarah Chen</h2>
              <p className="text-slate-300">MBA Admissions Interviewer</p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-400">Harvard Business School</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Current Question Display */}
          <AnimatePresence mode="wait">
            {showQuestion && (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-4xl mx-auto text-center mb-12"
              >
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full mb-6"
                  />
                  <h3 className="text-lg font-medium text-slate-300 mb-4">Question {currentQuestion} of {questions.length}</h3>
                  <p className="text-2xl md:text-3xl font-light text-white leading-relaxed">
                    {questions[currentQuestion - 1]}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Video Preview - Floating */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 right-8 w-64 h-48 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
              <Camera className="h-12 w-12 text-white/60" />
              
              {/* Recording Indicator */}
              <motion.div
                animate={{
                  opacity: isRecording ? [1, 0.3, 1] : 0.3
                }}
                transition={{
                  duration: 1.5,
                  repeat: isRecording ? Infinity : 0
                }}
                className="absolute top-4 left-4 flex items-center space-x-2"
              >
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-white font-medium">REC</span>
              </motion.div>

              {/* Audio Visualizer */}
              {isRecording && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center space-x-1">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-green-400 rounded-full"
                      animate={{
                        height: [4, Math.random() * 20 + 4, 4]
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Subtle Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-8"
          >
            <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <div className="flex items-center space-x-3">
                <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs text-white/70 font-medium">
                  {currentQuestion}/{questions.length}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ambient Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 3
              }}
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  // AI Settings Page
  const AISettingsPage = () => {
    const AdminAIInterviewSettings = React.lazy(() => import('@/components/admin-ai-interview-settings'));
    
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">InterviewAI Settings</span>
              </div>
              <Button variant="outline" onClick={() => setCurrentPage('dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </nav>
        
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading AI Settings...</p>
          </div>
        }>
          <AdminAIInterviewSettings />
        </React.Suspense>
      </div>
    )
  }

  // Main render logic
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'interview-setup':
        return <InterviewPrep />
      case 'system-check':
        return <SystemCheck />
      case 'interview':
        return <InterviewPage />
      case 'ai-settings':
        return <AISettingsPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {renderCurrentPage()}
    </div>
  )
}

export default AIInterviewPlatform 