"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  LineChart,
  MessageSquare,
  PlayCircle,
  Rocket,
  ScrollText,
  Star,
  Users,
} from "lucide-react"

export default function LandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              NEXUS<span className="text-primary">.</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
          <div className="container relative z-10">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="inline-flex mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    By Shubham Dixena
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    Your Complete{" "}
                    <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      Study Abroad
                    </span>{" "}
                    Solution
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    NEXUS streamlines your international education journey with powerful tools for university selection,
                    application management, and personalized guidance.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-2">
                      Start Your Journey <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => setIsVideoPlaying(true)}>
                    <PlayCircle className="h-4 w-4" /> Watch Demo
                  </Button>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <img
                          src={`/diverse-students-studying.png?height=32&width=32&query=student ${i} avatar`}
                          alt={`User ${i}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">1,000+</span> students already enrolled
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border shadow-xl">
                  {isVideoPlaying ? (
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                      title="NEXUS Demo Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <>
                      <img
                        src="/study-abroad-dashboard.png"
                        alt="NEXUS Platform Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Button
                          size="lg"
                          variant="outline"
                          className="rounded-full h-16 w-16 p-0 bg-white/90 hover:bg-white text-primary hover:text-primary"
                          onClick={() => setIsVideoPlaying(true)}
                        >
                          <PlayCircle className="h-8 w-8" />
                          <span className="sr-only">Play Demo Video</span>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                {/* Floating elements */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 hidden md:flex items-center gap-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Application Approved!</p>
                    <p className="text-xs text-muted-foreground">Harvard University</p>
                  </div>
                </motion.div>
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 hidden md:flex items-center gap-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="rounded-full bg-blue-100 p-2">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Scholarship Match!</p>
                    <p className="text-xs text-muted-foreground">$25,000 Available</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
        </section>

        {/* Trusted By Section */}
        <section className="border-y bg-muted/40">
          <div className="container py-12">
            <div className="text-center mb-8">
              <h2 className="text-xl font-medium text-muted-foreground">Trusted by students from</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 grayscale opacity-70">
              {["MIT", "Stanford", "Harvard", "Oxford", "Cambridge", "IIT"].map((uni) => (
                <div key={uni} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-semibold">{uni}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Everything You Need for Your{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Study Abroad Journey
                </span>
              </h2>
              <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
                NEXUS provides a comprehensive suite of tools to help you navigate every step of your international
                education journey.
              </p>
            </div>

            <Tabs defaultValue="universities" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl">
                  <TabsTrigger value="universities">Universities</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                  <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
                  <TabsTrigger value="guidance">Guidance</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="universities" className="mt-0">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Find Your Perfect University Match</h3>
                    <p className="text-muted-foreground">
                      Explore thousands of universities worldwide with detailed profiles, admission requirements, and
                      success rates. Our advanced filtering and comparison tools help you find the perfect fit for your
                      academic goals and preferences.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Comprehensive database of 10,000+ universities",
                        "Advanced filtering by program, location, and requirements",
                        "Side-by-side university comparison",
                        "Personalized university recommendations",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div>
                      <Button variant="outline" className="gap-2">
                        Explore Universities <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="rounded-lg overflow-hidden border shadow-lg">
                      <img src="/university-explorer-ui.png" alt="University Explorer" className="w-full h-auto" />
                    </div>
                    {/* Floating elements */}
                    <motion.div
                      className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-3 hidden md:block"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Star className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">94% Match</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="applications" className="mt-0">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Streamline Your Application Process</h3>
                    <p className="text-muted-foreground">
                      Manage all your university applications in one place with our intuitive dashboard. Track
                      deadlines, requirements, and application status to ensure you never miss an important date or
                      document.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Centralized application tracking system",
                        "Automated deadline reminders",
                        "Document management and checklists",
                        "Application status updates in real-time",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div>
                      <Button variant="outline" className="gap-2">
                        View Application Tools <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="rounded-lg overflow-hidden border shadow-lg">
                      <img src="/application-management-overview.png" alt="Application Management" className="w-full h-auto" />
                    </div>
                    {/* Floating elements */}
                    <motion.div
                      className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-3 hidden md:block"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-amber-100 p-2">
                          <LineChart className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">3 Applications</p>
                          <p className="text-xs text-muted-foreground">2 Pending, 1 Approved</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="scholarships" className="mt-0">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Discover Scholarships & Financial Aid</h3>
                    <p className="text-muted-foreground">
                      Access thousands of scholarship opportunities tailored to your profile. Our matching algorithm
                      identifies scholarships you're eligible for, helping you fund your international education.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Database of 50,000+ scholarships worldwide",
                        "Personalized scholarship matching",
                        "Application tracking and reminders",
                        "Financial planning tools and calculators",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div>
                      <Button variant="outline" className="gap-2">
                        Find Scholarships <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="rounded-lg overflow-hidden border shadow-lg">
                      <img src="/scholarship-search-dashboard.png" alt="Scholarship Finder" className="w-full h-auto" />
                    </div>
                    {/* Floating elements */}
                    <motion.div
                      className="absolute -top-6 -left-6 bg-white rounded-lg shadow-lg p-3 hidden md:block"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-100 p-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">12 Matches Found</p>
                          <p className="text-xs text-muted-foreground">$45,000 Available</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="guidance" className="mt-0">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Expert Guidance & Resources</h3>
                    <p className="text-muted-foreground">
                      Access personalized guidance from education experts, comprehensive resources, and a knowledge base
                      to navigate every aspect of studying abroad, from application essays to visa requirements.
                    </p>
                    <ul className="space-y-3">
                      {[
                        "One-on-one consultations with education experts",
                        "Comprehensive SOP and essay review services",
                        "Visa application guidance and checklists",
                        "Pre-departure orientation resources",
                      ].map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div>
                      <Button variant="outline" className="gap-2">
                        Explore Resources <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="rounded-lg overflow-hidden border shadow-lg">
                      <img src="/integrated-knowledge-platform.png" alt="Expert Guidance" className="w-full h-auto" />
                    </div>
                    {/* Floating elements */}
                    <motion.div
                      className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-3 hidden md:block"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-blue-100 p-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Expert Available</p>
                          <p className="text-xs text-muted-foreground">Book Consultation</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How NEXUS Works</h2>
              <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
                Our platform simplifies the complex process of studying abroad into four easy steps
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {[
                {
                  icon: <Users className="h-10 w-10 text-primary" />,
                  title: "Create Your Profile",
                  description:
                    "Set up your academic profile with your educational background, test scores, and preferences.",
                },
                {
                  icon: <GraduationCap className="h-10 w-10 text-primary" />,
                  title: "Explore Options",
                  description:
                    "Discover universities and programs that match your profile, with personalized recommendations.",
                },
                {
                  icon: <ScrollText className="h-10 w-10 text-primary" />,
                  title: "Apply with Confidence",
                  description: "Use our tools to prepare applications, track deadlines, and submit with confidence.",
                },
                {
                  icon: <Rocket className="h-10 w-10 text-primary" />,
                  title: "Prepare for Success",
                  description: "Access resources for visa applications, accommodation, and pre-departure preparation.",
                },
              ].map((step, i) => (
                <Card key={i} className="relative overflow-hidden border-none bg-background shadow-md">
                  <div className="absolute top-0 left-0 h-1 w-full bg-primary"></div>
                  <CardContent className="pt-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start Your Journey <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Success Stories from{" "}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Our Students
                </span>
              </h2>
              <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
                Hear from students who achieved their study abroad dreams with NEXUS
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  name: "Priya Sharma",
                  role: "MBA Student, Harvard Business School",
                  image: "/placeholder.svg?height=200&width=200&query=indian female student portrait",
                  quote:
                    "NEXUS simplified my application process for top MBA programs. Their scholarship matching feature helped me secure a $40,000 scholarship that made Harvard possible for me.",
                },
                {
                  name: "David Chen",
                  role: "Computer Science, Stanford University",
                  image: "/placeholder.svg?height=200&width=200&query=asian male student portrait",
                  quote:
                    "The university comparison tools helped me find the perfect program for my interests. The application tracking system ensured I never missed a deadline. I couldn't have done it without NEXUS!",
                },
                {
                  name: "Sophia Rodriguez",
                  role: "International Relations, Oxford University",
                  image: "/placeholder.svg?height=200&width=200&query=latina female student portrait",
                  quote:
                    "The expert guidance on my statement of purpose made all the difference. NEXUS connected me with alumni who provided invaluable insights about my dream university.",
                },
              ].map((testimonial, i) => (
                <Card key={i} className="overflow-hidden border-none shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 h-20 w-20 overflow-hidden rounded-full">
                        <img
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mb-4 flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="mb-4 italic text-muted-foreground">"{testimonial.quote}"</p>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Link href="/testimonials">
                <Button variant="outline" className="gap-2">
                  Read More Success Stories <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
                Choose the plan that fits your study abroad journey
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  name: "Free",
                  price: "$0",
                  description: "Basic tools to start your journey",
                  features: [
                    "University database access",
                    "Basic profile creation",
                    "Limited university comparisons",
                    "Community forum access",
                  ],
                  cta: "Get Started",
                  popular: false,
                },
                {
                  name: "Premium",
                  price: "$19.99",
                  period: "monthly",
                  description: "Everything you need for successful applications",
                  features: [
                    "All Free features",
                    "Unlimited university comparisons",
                    "Application tracking system",
                    "Document management",
                    "Scholarship matching",
                    "Email support",
                  ],
                  cta: "Start 7-Day Free Trial",
                  popular: true,
                },
                {
                  name: "Ultimate",
                  price: "$49.99",
                  period: "monthly",
                  description: "Premium features plus expert guidance",
                  features: [
                    "All Premium features",
                    "3 expert consultation sessions",
                    "SOP & essay review",
                    "Mock interview preparation",
                    "Visa application guidance",
                    "Priority support",
                  ],
                  cta: "Get Ultimate Access",
                  popular: false,
                },
              ].map((plan, i) => (
                <Card
                  key={i}
                  className={`overflow-hidden ${
                    plan.popular ? "border-primary shadow-lg shadow-primary/20" : "border-border shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-primary py-1 text-center text-sm font-medium text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        {plan.period && <span className="ml-1 text-sm text-muted-foreground">/{plan.period}</span>}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="mb-6">
                      <ul className="space-y-2">
                        {plan.features.map((feature, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      className={`w-full ${plan.popular ? "" : "bg-muted hover:bg-muted/80 text-foreground"}`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground">
                All plans include a 30-day money-back guarantee. Need a custom solution?{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact us
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
                Find answers to common questions about NEXUS and studying abroad
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              {[
                {
                  question: "How does NEXUS help with university selection?",
                  answer:
                    "NEXUS provides a comprehensive database of universities worldwide with detailed profiles, admission requirements, and success rates. Our advanced filtering and comparison tools help you find universities that match your academic profile, preferences, and career goals.",
                },
                {
                  question: "Can NEXUS help me find scholarships?",
                  answer:
                    "Yes! Our platform features a scholarship matching system that connects you with relevant opportunities based on your profile, nationality, field of study, and other criteria. We maintain a database of over 50,000 scholarships that is regularly updated.",
                },
                {
                  question: "How does the application tracking system work?",
                  answer:
                    "Our application tracking system allows you to manage all your university applications in one place. You can track deadlines, required documents, and application status. The system sends automated reminders for upcoming deadlines and tasks to ensure you stay on track.",
                },
                {
                  question: "What kind of expert guidance does NEXUS provide?",
                  answer:
                    "NEXUS offers various levels of expert guidance, including SOP and essay reviews, mock interviews, and one-on-one consultations with education experts who have experience with specific universities and programs. Premium and Ultimate plans include direct access to these services.",
                },
                {
                  question: "Is NEXUS available worldwide?",
                  answer:
                    "Yes, NEXUS is available to students worldwide. Our platform supports international students from any country looking to study abroad, with specialized resources for different regions and nationalities.",
                },
                {
                  question: "Can I cancel my subscription anytime?",
                  answer:
                    "You can cancel your subscription at any time. We offer a 30-day money-back guarantee on all paid plans, so you can try NEXUS risk-free.",
                },
              ].map((faq, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold">{faq.question}</h4>
                    <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground">
                Have more questions?{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact our support team
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Start Your Study Abroad Journey?
              </h2>
              <p className="mt-4 text-xl max-w-2xl mx-auto opacity-90">
                Join thousands of students who have successfully navigated their international education with NEXUS.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Get Started for Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Request a Demo <PlayCircle className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold tracking-tight">
                  NEXUS<span className="text-primary">.</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your complete platform for international education, helping students achieve their study abroad dreams.
              </p>
              <div className="flex gap-4">
                {["twitter", "facebook", "instagram", "linkedin"].map((social) => (
                  <Link
                    key={social}
                    href={`#${social}`}
                    className="rounded-full bg-background p-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {["Features", "Universities", "Scholarships", "Applications", "Resources"].map((item) => (
                  <li key={item}>
                    <Link href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {["About Us", "Team", "Careers", "Press", "Contact"].map((item) => (
                  <li key={item}>
                    <Link href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {["Terms of Service", "Privacy Policy", "Cookie Policy", "GDPR"].map((item) => (
                  <li key={item}>
                    <Link href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-primary">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} NEXUS by Shubham Dixena. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
