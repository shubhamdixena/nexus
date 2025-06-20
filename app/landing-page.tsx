"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  LineChart,
  MessageSquare,
  PlayCircle,
  Rocket,
  ScrollText,
  Star,
  Users,
  BarChart3,
  Calendar,
  FileText,
  Globe,
  MapPin,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react"
import Image from "next/image"

export default function NexusLanding() {
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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">NEXUS</span>
          </div>
          <nav className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Funding Badge */}
            <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              We've helped 15,000+ students get accepted →
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Organize Your Study Abroad Journey<br />
              with{" "}
              <span className="text-black dark:text-white underline decoration-4 underline-offset-8">
                Intelligence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-3xl mx-auto">
              Everything study abroad seamlessly integrated: all the modern application management tools in one platform
              so that you can organize your journey with a single click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-8 py-3 text-lg">
                  Get started
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="px-8 py-3 text-lg text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                Contact us →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Mockup */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-lg">NEXUS Dashboard</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
                    />
                  </div>
                  <Badge className="bg-black dark:bg-white text-white dark:text-black">Full Screen</Badge>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="grid lg:grid-cols-4 gap-6 mb-8">
                {/* Metrics Cards */}
                <Card className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Applications</span>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-black dark:text-white">12,345</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">The total number of submitted applications</div>
                </Card>

                <Card className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">New Students</span>
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-black dark:text-white">1,234</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">The number of new students that signed up this month</div>
                </Card>

                <Card className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Acceptance Rate</span>
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-black dark:text-white">89%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">The percentage of applications that get accepted</div>
                </Card>

                <Card className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Scholarships Won</span>
                    <Zap className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-black dark:text-white">$3.2M</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Total scholarship money secured this year</div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold mb-2 text-black dark:text-white">Application Trends</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">A line chart showing application trends over time</p>
                  <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-end justify-center space-x-1 p-4">
                    {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                      <div
                        key={i}
                        className="bg-black dark:bg-white rounded-sm"
                        style={{ height: `${height}%`, width: "12px" }}
                      />
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold mb-2 text-black dark:text-white">Student Acquisition</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">A bar chart showing student acquisition by channel</p>
                  <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-end justify-center space-x-2 p-4">
                    {[60, 80, 90, 70, 85, 65].map((height, i) => (
                      <div key={i} className="bg-black dark:bg-white rounded-sm" style={{ height: `${height}%`, width: "16px" }} />
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold mb-2 text-black dark:text-white">Top Destinations</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">A pie chart showing the top study destinations</p>
                  <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-black dark:bg-white flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white dark:bg-black flex items-center justify-center">
                        <span className="text-xs font-semibold text-black dark:text-white">USA 45%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted by Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Trusted by the best universities</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-12">Join thousands of students who trust us with their future</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              <div className="text-2xl font-bold text-gray-400">HARVARD</div>
              <div className="text-2xl font-bold text-gray-400">MIT</div>
              <div className="text-2xl font-bold text-gray-400">OXFORD</div>
              <div className="text-2xl font-bold text-gray-400">STANFORD</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black dark:text-white">Packed with thousands of features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Everything you need to organize your study abroad journey, from application tracking to scholarship
              discovery.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">Generate insights with text</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get personalized recommendations for programs, scholarships, and application strategies based on your
                profile and preferences.
              </p>
              <div className="space-y-4">
                <Card className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
                      <Search className="w-4 h-4 text-white dark:text-black" />
                    </div>
                    <span className="text-sm text-black dark:text-white">Find programs matching your GPA and budget</span>
                  </div>
                </Card>
                <Card className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white dark:text-black" />
                    </div>
                    <span className="text-sm text-black dark:text-white">Discover hidden scholarship opportunities</span>
                  </div>
                </Card>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 h-64 flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=200&width=300"
                alt="Feature illustration"
                width={300}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 h-64 flex items-center justify-center lg:order-first">
              <div className="space-y-3 w-full max-w-sm">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-8 bg-black dark:bg-white rounded"></div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">Create visual simple chatbots</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get instant answers to your study abroad questions with our AI-powered chatbot that understands visa
                requirements, application deadlines, and more.
              </p>
              <div className="space-y-4">
                <Card className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white dark:text-black" />
                    </div>
                    <span className="text-sm text-black dark:text-white">Track application deadlines automatically</span>
                  </div>
                </Card>
                <Card className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white dark:text-black" />
                    </div>
                    <span className="text-sm text-black dark:text-white">Organize documents in one secure place</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            {[
              {
                icon: Globe,
                title: "Global reach",
                description: "Access programs from universities worldwide with comprehensive data and insights.",
              },
              {
                icon: Zap,
                title: "Fast and efficient",
                description: "Streamline your application process and save 40+ hours per application cycle.",
              },
              {
                icon: CheckCircle2,
                title: "Easy to use and setup",
                description: "Get started in minutes with our intuitive interface designed for students.",
              },
              {
                icon: MapPin,
                title: "Multiple destinations",
                description: "Explore study opportunities across 50+ countries with detailed comparisons.",
              },
              {
                icon: Users,
                title: "Multi-tenant Architecture",
                description: "Collaborate with counselors, family, and friends on your application journey.",
              },
              {
                icon: Star,
                title: "99.9% Uptime Support",
                description: "Reliable platform that's always available when you need it most.",
              },
              {
                icon: FileText,
                title: "White-label solutions",
                description: "Custom solutions for educational consultants and institutions.",
              },
              {
                icon: BarChart3,
                title: "Advanced analytics",
                description: "Track your progress and optimize your application strategy with data insights.",
              },
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-black dark:text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-black dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black dark:text-white">
              Loved by students all around the world
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              See what students are saying about their experience with Nexus and how it transformed their study abroad
              journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Now at Oxford University",
                avatar: "SC",
                content:
                  "Nexus helped me organize my applications to 8 different universities. I got accepted to 6 of them and received $15,000 in scholarships I never knew existed.",
              },
              {
                name: "Marcus Johnson",
                role: "Now at ETH Zurich",
                avatar: "MJ",
                content:
                  "The deadline tracking feature saved my life. I almost missed my visa application deadline, but Nexus reminded me 6 weeks in advance. Now I'm studying my dream program!",
              },
              {
                name: "Priya Patel",
                role: "Now at University of Toronto",
                avatar: "PP",
                content:
                  "I was drowning in paperwork and browser tabs. Nexus organized everything in one place and made the whole process actually manageable. Highly recommend!",
              },
              {
                name: "Ahmed Hassan",
                role: "Now at MIT",
                avatar: "AH",
                content:
                  "The scholarship finder is incredible. It found niche scholarships that perfectly matched my background. I saved over $20,000 on my education.",
              },
              {
                name: "Emma Rodriguez",
                role: "Now at Cambridge",
                avatar: "ER",
                content:
                  "As someone who applied to programs in 4 different countries, Nexus was a lifesaver. It handled all the different requirements and deadlines perfectly.",
              },
              {
                name: "David Kim",
                role: "Now at Stanford",
                avatar: "DK",
                content:
                  "The AI recommendations were spot-on. It suggested programs I never would have found on my own, and I ended up at my dream school because of it.",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-black dark:text-white">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-black dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{testimonial.content}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-black dark:bg-white text-white dark:text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to organize your study abroad journey?</h2>
          <p className="text-xl text-gray-300 dark:text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have successfully organized their applications and achieved their study
            abroad dreams.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white dark:bg-black text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 px-8 py-3 text-lg">
              Get started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-black py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl font-bold tracking-tight text-black dark:text-white">NEXUS</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Making study abroad applications organized and stress-free for students worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-black dark:text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-black dark:text-white">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-black dark:text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 NEXUS. All rights reserved. Built by students, for students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
