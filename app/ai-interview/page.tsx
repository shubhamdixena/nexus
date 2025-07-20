"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  ArrowLeft, 
  Search, 
  MapPin, 
  Users, 
  Calendar,
  ChevronRight,
  Loader2,
  Star,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

// Import new interview components
import PermissionHandler from '@/components/interview/PermissionHandler';
import InterviewCountdown from '@/components/interview/InterviewCountdown';
import ImmersiveInterview from '@/components/interview/ImmersiveInterview';

interface MBASchool {
  id: string
  business_school: string
  location: string
  country: string
  qs_mba_rank: number | null
}

type InterviewPhase = 'school-selection' | 'permission-check' | 'countdown' | 'interview'

export default function AIInterviewPage() {
  const [schools, setSchools] = useState<MBASchool[]>([])
  const [filteredSchools, setFilteredSchools] = useState<MBASchool[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<MBASchool | null>(null)
  const [currentPhase, setCurrentPhase] = useState<InterviewPhase>('school-selection')
  const [isInitialized, setIsInitialized] = useState(false)
  
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  // Restore state from localStorage on component mount
  useEffect(() => {
    const savedPhase = localStorage.getItem('ai-interview-phase') as InterviewPhase
    const savedSchool = localStorage.getItem('ai-interview-school')
    
    if (savedPhase && savedSchool) {
      try {
        const school = JSON.parse(savedSchool)
        setCurrentPhase(savedPhase)
        setSelectedSchool(school)
      } catch (error) {
        console.error('Failed to parse saved school data:', error)
        localStorage.removeItem('ai-interview-phase')
        localStorage.removeItem('ai-interview-school')
      }
    }
    setIsInitialized(true)
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return
    
    if (currentPhase !== 'school-selection' && selectedSchool) {
      localStorage.setItem('ai-interview-phase', currentPhase)
      localStorage.setItem('ai-interview-school', JSON.stringify(selectedSchool))
    } else {
      localStorage.removeItem('ai-interview-phase')
      localStorage.removeItem('ai-interview-school')
    }
  }, [currentPhase, selectedSchool, isInitialized])

  // Fetch schools from Supabase
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase
          .from('mba_schools')
          .select('id, business_school, location, country, qs_mba_rank')
          .order('qs_mba_rank', { ascending: true, nullsFirst: false })

        if (error) throw error

        setSchools(data || [])
        setFilteredSchools(data || [])
      } catch (error) {
        console.error('Error fetching schools:', error)
        toast({
          title: "Error Loading Schools",
          description: "Failed to load MBA schools. Please refresh the page.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [supabase, toast])

  // Filter schools based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Show only top 12 schools initially unless "Show All" is clicked
      const schoolsToShow = showAll ? schools : schools.slice(0, 12)
      setFilteredSchools(schoolsToShow)
      return
    }

    const filtered = schools.filter(school =>
      school.business_school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.country.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredSchools(filtered)
  }, [searchTerm, schools, showAll])

  // Handle school selection and start interview flow
  const handleStartInterview = (school: MBASchool) => {
    setSelectedSchool(school)
    setCurrentPhase('permission-check')
  }

  // Permission handlers
  const handlePermissionGranted = () => {
    setCurrentPhase('countdown')
  }

  const handlePermissionDenied = () => {
    setCurrentPhase('school-selection')
    setSelectedSchool(null)
  }

  // Countdown completion
  const handleCountdownComplete = () => {
    setCurrentPhase('interview')
  }

  // Exit interview
  const handleExitInterview = () => {
    console.log('Handling exit interview - clearing state');
    
    // Clear interview state from localStorage
    localStorage.removeItem('ai-interview-phase');
    localStorage.removeItem('ai-interview-school');
    
    // Reset component state
    setCurrentPhase('school-selection');
    setSelectedSchool(null);
  };

  // This is a new function to handle countdown skip
  const handleSkipCountdown = () => {
    setCurrentPhase('interview');
  };

  // Render based on current phase
  return (
    <AnimatePresence mode="wait">
      {currentPhase === 'school-selection' && (
        <motion.div
          key="school-selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
        >
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => router.back()}
                  className="absolute left-4 top-8"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
              </div>
              
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                AI Mock Interview
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Practice with our AI interviewer trained on real MBA admission scenarios. 
                Select your target school to begin a personalized interview experience.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by school name, location, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg border-2 border-slate-200 focus:border-blue-500 rounded-xl"
                />
              </div>
            </motion.div>

            {/* Schools Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-slate-600">Loading schools...</span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto"
              >
                {filteredSchools.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-600 mb-2">No schools found</h3>
                    <p className="text-slate-500">Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredSchools.map((school, index) => (
                    <motion.div
                      key={school.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group"
                    >
                      <Card className="h-full border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors leading-tight">
                                {school.business_school}
                              </CardTitle>
                              
                              <div className="flex items-center text-sm text-slate-500 mt-2">
                                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {school.location}, {school.country}
                                </span>
                              </div>
                            </div>
                            
                            {school.qs_mba_rank && (
                              <Badge variant="secondary" className="ml-2 flex-shrink-0">
                                <Star className="w-3 h-3 mr-1" />
                                #{school.qs_mba_rank}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <Button 
                            onClick={() => handleStartInterview(school)}
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            variant="outline"
                          >
                            Start Interview
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Summary Stats and Show More */}
            {!loading && filteredSchools.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mt-8 space-y-4"
              >
                <p className="text-slate-500">
                  Showing {filteredSchools.length} of {schools.length} schools
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
                
                {/* Show All Button */}
                {!searchTerm && !showAll && schools.length > 12 && (
                  <Button
                    onClick={() => setShowAll(true)}
                    variant="outline"
                    className="text-slate-600 border-slate-300 hover:bg-slate-50"
                  >
                    Show All {schools.length} Schools
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {currentPhase === 'permission-check' && selectedSchool && (
        <PermissionHandler
          key="permission"
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
        />
      )}

      {currentPhase === 'countdown' && selectedSchool && (
        <motion.div
          key="countdown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <InterviewCountdown
            onCountdownComplete={handleCountdownComplete}
            onSkip={handleSkipCountdown} // Pass the new skip handler
          />
        </motion.div>
      )}

      {currentPhase === 'interview' && selectedSchool && (
        <motion.div
          key="interview"
          className="fixed inset-0 bg-black z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ImmersiveInterview
            schoolId={selectedSchool.id}
            schoolName={selectedSchool.business_school}
            onExit={handleExitInterview}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
