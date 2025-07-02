"use client"

import { useState, useEffect } from 'react'
import { Plus, Search, FileText, Users, Save, Edit3, CheckCircle2, Circle, X, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// All data is now loaded dynamically from the database

function SchoolListItem({ school, isSelected, onClick, progress, isLast }: { 
  school: any, 
  isSelected: boolean, 
  onClick: () => void,
  progress: number,
  isLast?: boolean
}) {
  return (
    <>
      <div 
        className={`p-3 cursor-pointer transition-all duration-200 rounded-md border-l-3 ${
          isSelected 
            ? 'bg-primary/10 border-l-primary shadow-sm' 
            : 'hover:bg-accent/50 border-l-transparent hover:border-l-accent-foreground/20'
        }`}
        onClick={onClick}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className={`font-medium text-sm leading-tight ${isSelected ? 'text-primary' : ''}`}>
              {school.school_name}
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
      {!isLast && <Separator className="my-1 mx-1" />}
    </>
  )
}

function EssayEditor({ essay, onSave }: { 
  essay: any, 
  onSave: (id: string, content: string) => void
}) {
  const [content, setContent] = useState(essay.content || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    onSave(essay.id, content)
    setIsSaving(false)
  }

  const wordCount = content.trim().split(/\s+/).filter((word: string) => word.length > 0).length
  const isOverLimit = essay.max_word_limit && wordCount > essay.max_word_limit

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{essay.title}</h3>
            <div className="flex items-center gap-1">
              <span className={`text-xs ${isOverLimit ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                {wordCount} / {essay.max_word_limit || '∞'} words
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-7 w-7 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-7 w-7 p-0"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                ) : (
                  <Save className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{essay.prompt}</p>
        </div>
      </div>
      
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing your essay..."
        className="min-h-[160px] resize-none text-sm"
      />
    </div>
  )
}

function LORSimpleEditor({ lor, onSave }: { 
  lor: any, 
  onSave: (id: string, data: any) => void
}) {
  const [formData, setFormData] = useState({
    recommender_name: lor.recommender_name || '',
    recommender_company: lor.recommender_company || '',
    content: lor.content || '',
    additional_content: lor.additional_content || ''
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showAdditionalModal, setShowAdditionalModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    onSave(lor.id, formData)
    setIsSaving(false)
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{lor.title}</h3>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAdditionalModal(true)}
              className="h-7 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Additional
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-7 w-7 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-7 w-7 p-0"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
              ) : (
                <Save className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name" className="text-xs font-medium">Name</Label>
            <Input
              id="name"
              value={formData.recommender_name}
              onChange={(e) => setFormData({...formData, recommender_name: e.target.value})}
              placeholder="Full name"
              className="h-8 text-sm mt-1"
            />
          </div>
          <div>
            <Label htmlFor="company" className="text-xs font-medium">Company</Label>
            <Input
              id="company"
              value={formData.recommender_company}
              onChange={(e) => setFormData({...formData, recommender_company: e.target.value})}
              placeholder="Company/University"
              className="h-8 text-sm mt-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="content" className="text-xs font-medium">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            placeholder="Add LOR content and notes..."
            className="min-h-[100px] text-sm resize-none mt-1"
          />
        </div>
      </div>

      {/* Additional Content Modal */}
      <Dialog open={showAdditionalModal} onOpenChange={setShowAdditionalModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Additional Content - {lor.title}</DialogTitle>
            <DialogDescription>
              Add any additional requirements, specific instructions, or supplementary information for this letter of recommendation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="additional-modal" className="text-sm">Additional Content</Label>
              <Textarea
                id="additional-modal"
                value={formData.additional_content}
                onChange={(e) => setFormData({...formData, additional_content: e.target.value})}
                placeholder="Enter additional requirements, specific instructions, deadlines, submission formats, etc..."
                className="min-h-[200px] mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdditionalModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleSave()
              setShowAdditionalModal(false)
            }}>
              Save Additional Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function LOREditForm({ lor, onSave, onCancel }: {
  lor: any,
  onSave: (id: string, data: any) => void,
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    recommender_name: lor.recommender_name || '',
    recommender_title: lor.recommender_title || '',
    recommender_organization: lor.recommender_organization || '',
    recommender_email: lor.recommender_email || '',
    relationship_to_applicant: lor.relationship_to_applicant || 'supervisor',
    notes: lor.notes || '',
    status: lor.status || 'pending_request'
  })

  const handleSave = () => {
    onSave(lor.id, formData)
    onCancel()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.recommender_name}
            onChange={(e) => setFormData({...formData, recommender_name: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.recommender_title}
            onChange={(e) => setFormData({...formData, recommender_title: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            value={formData.recommender_organization}
            onChange={(e) => setFormData({...formData, recommender_organization: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.recommender_email}
            onChange={(e) => setFormData({...formData, recommender_email: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="relationship">Relationship</Label>
          <Select 
            value={formData.relationship_to_applicant} 
            onValueChange={(value) => setFormData({...formData, relationship_to_applicant: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="professor">Professor</SelectItem>
              <SelectItem value="colleague">Colleague</SelectItem>
              <SelectItem value="mentor">Mentor</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData({...formData, status: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending_request">Pending Request</SelectItem>
              <SelectItem value="request_sent">Request Sent</SelectItem>
              <SelectItem value="agreed">Agreed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Add notes about this recommendation..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}

function AddLORDialog({ open, onOpenChange, onAdd }: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  onAdd: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    recommender_name: '',
    recommender_title: '',
    recommender_organization: '',
    recommender_email: '',
    relationship_to_applicant: 'supervisor'
  })

  const handleAdd = () => {
    if (formData.recommender_name.trim()) {
      onAdd(formData)
      setFormData({
        recommender_name: '',
        recommender_title: '',
        recommender_organization: '',
        recommender_email: '',
        relationship_to_applicant: 'supervisor'
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Letter of Recommendation</DialogTitle>
          <DialogDescription>
            Add details for a new letter of recommendation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="add-name">Recommender Name</Label>
            <Input
              id="add-name"
              value={formData.recommender_name}
              onChange={(e) => setFormData({...formData, recommender_name: e.target.value})}
              placeholder="John Smith"
            />
          </div>
          <div>
            <Label htmlFor="add-title">Title</Label>
            <Input
              id="add-title"
              value={formData.recommender_title}
              onChange={(e) => setFormData({...formData, recommender_title: e.target.value})}
              placeholder="Senior Manager"
            />
          </div>
          <div>
            <Label htmlFor="add-org">Organization</Label>
            <Input
              id="add-org"
              value={formData.recommender_organization}
              onChange={(e) => setFormData({...formData, recommender_organization: e.target.value})}
              placeholder="Company Name"
            />
          </div>
          <div>
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              type="email"
              value={formData.recommender_email}
              onChange={(e) => setFormData({...formData, recommender_email: e.target.value})}
              placeholder="john@company.com"
            />
          </div>
          <div>
            <Label htmlFor="add-relationship">Relationship</Label>
            <Select 
              value={formData.relationship_to_applicant} 
              onValueChange={(value) => setFormData({...formData, relationship_to_applicant: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="professor">Professor</SelectItem>
                <SelectItem value="colleague">Colleague</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add Recommendation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddEssayDialog({ open, onOpenChange, onAdd }: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  onAdd: (data: any) => void
}) {
  const [formData, setFormData] = useState({
    essay_title: '',
    essay_prompt: '',
    max_word_limit: 500
  })

  const handleAdd = () => {
    if (formData.essay_title.trim() && formData.essay_prompt.trim()) {
      onAdd({
        id: Date.now().toString(), // Temporary ID
        ...formData,
        content: '',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setFormData({
        essay_title: '',
        essay_prompt: '',
        max_word_limit: 500
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Essay</DialogTitle>
          <DialogDescription>
            Create a custom essay prompt for this school
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="essay-title">Essay Title</Label>
            <Input
              id="essay-title"
              value={formData.essay_title}
              onChange={(e) => setFormData({...formData, essay_title: e.target.value})}
              placeholder="e.g., Essay 1, Essay 2, Optional Essay"
            />
          </div>
          <div>
            <Label htmlFor="essay-prompt">Essay Prompt</Label>
            <Textarea
              id="essay-prompt"
              value={formData.essay_prompt}
              onChange={(e) => setFormData({...formData, essay_prompt: e.target.value})}
              placeholder="Enter the essay question or prompt..."
              className="min-h-[100px]"
            />
          </div>
          <div>
            <Label htmlFor="word-limit">Word Limit</Label>
            <Input
              id="word-limit"
              type="number"
              value={formData.max_word_limit}
              onChange={(e) => setFormData({...formData, max_word_limit: parseInt(e.target.value) || 500})}
              min="50"
              max="2000"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add Essay</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ApplicationsPage() {
  const [targetSchools, setTargetSchools] = useState<any[]>([])
  const [selectedSchool, setSelectedSchool] = useState<any>(null)
  const [otherContent, setOtherContent] = useState('')
  const [essays, setEssays] = useState<any[]>([])
  const [lors, setLors] = useState<any[]>([])
  const [loading, setLoading] = useState(true) // For initial page load
  const [schoolContentLoading, setSchoolContentLoading] = useState(false) // For school-specific content
  const [progressData, setProgressData] = useState<Record<string, any>>({})
  const [showAddEssayDialog, setShowAddEssayDialog] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false) // Cache flag
  
  const supabase = createClient()
  const router = useRouter()

  // Load user's target schools and application data
  useEffect(() => {
    loadApplicationData()
  }, [])

  // Function to refresh data
  const refreshData = () => {
    setDataLoaded(false)
    loadApplicationData(true)
  }

  const loadApplicationData = async (forceReload = false) => {
    // Skip loading if data is already loaded and not forcing reload
    if (dataLoaded && !forceReload) {
      return
    }

    try {
      setLoading(true)
      
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/auth/login')
        return
      }

      // Load target schools with their MBA school details
      const { data: targets, error: targetsError } = await supabase
        .from('user_school_targets')
        .select(`
          *,
          mba_schools:school_id (
            id,
            business_school,
            location,
            qs_mba_rank,
            ft_global_mba_rank,
            bloomberg_mba_rank,
            mean_gmat,
            avg_starting_salary,
            tuition_total,
            class_size
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (targetsError) {
        console.error('Error loading target schools:', targetsError)
        toast.error('Failed to load target schools')
        return
      }

      // Format the schools data
      const formattedSchools = targets?.map(target => ({
        id: target.id,
        school_id: target.school_id, // Keep original schema field name
        mba_school_id: target.school_id, // Also provide for compatibility
        school_name: target.mba_schools?.business_school || 'Unknown School',
        business_school: target.mba_schools?.business_school,
        location: target.mba_schools?.location || 'Unknown Location',
        target_category: target.target_category, // Use correct schema field name
        priority_score: target.priority_score, // Use correct schema field name
        notes: target.notes
      })) || []

      setTargetSchools(formattedSchools)

      // Load application progress for all schools
      try {
        const response = await fetch('/api/application-progress?include_school=false')
        const result = await response.json()

        if (response.ok && result.data) {
          // Create a map of school_id -> progress data
          const progressMap = result.data.reduce((acc: any, progress: any) => {
            acc[progress.mba_school_id] = progress
            return acc
          }, {})
          setProgressData(progressMap)
        } else {
          console.error('Error loading progress:', result)
        }
      } catch (error) {
        console.error('Error loading progress:', error)
      }

      // Mark data as loaded
      setDataLoaded(true)

    } catch (error) {
      console.error('Error loading application data:', error)
      toast.error('Failed to load application data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEssay = async (id: string, content: string) => {
    try {
      // Update local state immediately for responsive UI
      setEssays(prev => prev.map(essay => 
        essay.id === id ? {...essay, content, updated_at: new Date().toISOString()} : essay
      ))

      // Save to database
      const response = await fetch(`/api/application-essays?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('Failed to save essay')
      }

      toast.success('Essay saved successfully')
    } catch (error) {
      console.error('Error saving essay:', error)
      toast.error('Failed to save essay')
    }
  }

  const handleAddEssay = async (essayData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !selectedSchool) return

      const progressId = progressData[selectedSchool.mba_school_id]?.id
      if (!progressId) {
        toast.error('No application progress found')
        return
      }

      // Create essay in database
      const { data: newEssay, error } = await supabase
        .from('user_application_essays')
        .insert({
          user_id: user.id,
          application_progress_id: progressId,
          essay_title: essayData.essay_title,
          essay_prompt: essayData.essay_prompt,
          max_word_limit: essayData.max_word_limit,
          content: essayData.content || ''
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating essay:', error)
        toast.error('Failed to create essay')
        return
      }

      // Add to local state
      const formattedEssay = {
        id: newEssay.id,
        title: newEssay.essay_title,
        prompt: newEssay.essay_prompt,
        max_word_limit: newEssay.max_word_limit,
        content: newEssay.content,
        updated_at: newEssay.updated_at
      }

      setEssays(prev => [...prev, formattedEssay])
      toast.success('Essay created successfully')
    } catch (error) {
      console.error('Error adding essay:', error)
      toast.error('Failed to create essay')
    }
  }

  const handleSaveLOR = (id: string, data: any) => {
    setLors(prev => prev.map(lor => 
      lor.id === id ? {...lor, ...data, updated_at: new Date().toISOString()} : lor
    ))
    console.log('Saving LOR:', id, data)
  }

  const handleDeleteLOR = (id: string) => {
    setLors(prev => prev.filter(lor => lor.id !== id))
    console.log('Deleting LOR:', id)
  }

  const handleAddLOR = (lorData: any) => {
    const newLOR = {
      id: Date.now().toString(),
      ...lorData,
      status: 'pending_request',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setLors(prev => [...prev, newLOR])
    console.log('Adding LOR:', newLOR)
  }

  // When school is selected, load or create application progress and essays/LORs
  const handleSchoolSelect = async (school: any) => {
    try {
      setSelectedSchool(school)
      setSchoolContentLoading(true) // Use separate loading state for school content
      
      // Get or create application progress
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let progressId = progressData[school.mba_school_id]?.id

      // If no progress exists, create it
      if (!progressId) {
        try {
          const response = await fetch('/api/application-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mba_school_id: school.mba_school_id,
              application_status: 'not_started',
              notes: `Application for ${school.school_name}`
            })
          })

          const result = await response.json()

          if (!response.ok) {
            console.error('Error creating progress:', result)
            if (result.error === 'Application progress already exists for this school') {
              // If it already exists, fetch it
              const fetchResponse = await fetch(`/api/application-progress?include_school=false`)
              const fetchResult = await fetchResponse.json()
              
              if (fetchResponse.ok && fetchResult.data) {
                const existingProgress = fetchResult.data.find((p: any) => p.mba_school_id === school.mba_school_id)
                if (existingProgress) {
                  progressId = existingProgress.id
                  setProgressData(prev => ({
                    ...prev,
                    [school.mba_school_id]: existingProgress
                  }))
                }
              }
            } else {
              toast.error('Failed to create application progress')
              return
            }
          } else {
            progressId = result.data.id
            setProgressData(prev => ({
              ...prev,
              [school.mba_school_id]: result.data
            }))
          }
        } catch (error) {
          console.error('Error creating progress:', error)
          toast.error('Failed to create application progress')
          return
        }
      }

      // Load existing essays for this application
      const { data: existingEssays, error: essaysError } = await supabase
        .from('user_application_essays')
        .select('*')
        .eq('application_progress_id', progressId)
        .order('created_at', { ascending: true })

      if (essaysError) {
        console.error('Error loading essays:', essaysError)
        toast.error('Failed to load essays')
        return
      }

      // Load existing LORs for this application  
      const { data: existingLORs, error: lorsError } = await supabase
        .from('user_application_lors')
        .select('*')
        .eq('application_progress_id', progressId)
        .order('created_at', { ascending: true })

      if (lorsError) {
        console.error('Error loading LORs:', lorsError)
        toast.error('Failed to load LORs')
        return
      }

      // Format essays for UI
      const formattedEssays = (existingEssays || []).map(essay => ({
        id: essay.id,
        title: essay.essay_title || 'Essay',
        prompt: essay.essay_prompt || 'Enter your essay prompt...',
        max_word_limit: essay.max_word_limit || 500,
        content: essay.content || '',
        updated_at: essay.updated_at
      }))

      // Format LORs for UI
      const formattedLORs = (existingLORs || []).map(lor => ({
        id: lor.id,
        recommender_name: lor.recommender_name || '',
        recommender_title: lor.recommender_title || '',
        recommender_organization: lor.recommender_organization || '',
        recommender_company: lor.recommender_organization || '', // Using organization as company
        content: lor.content || '',
        additional_content: lor.notes || '',
        status: lor.status || 'pending_request'
      }))

      // If no essays exist, create default ones
      if (formattedEssays.length === 0) {
        await createDefaultEssays(progressId, user.id)
      } else {
        setEssays(formattedEssays)
      }

      // If no LORs exist, create default ones
      if (formattedLORs.length === 0) {
        await createDefaultLORs(progressId, user.id)
      } else {
        setLors(formattedLORs)
      }

    } catch (error) {
      console.error('Error selecting school:', error)
      toast.error('Failed to load school data')
    } finally {
      setSchoolContentLoading(false)
    }
  }

  const createDefaultEssays = async (progressId: string, userId: string) => {
    try {
      const defaultEssays = [
        {
          user_id: userId,
          application_progress_id: progressId,
          essay_title: 'Essay 1',
          essay_prompt: 'Enter your essay prompt here...',
          max_word_limit: 500,
          content: ''
        },
        {
          user_id: userId,
          application_progress_id: progressId,
          essay_title: 'Essay 2',
          essay_prompt: 'Enter your essay prompt here...',
          max_word_limit: 500,
          content: ''
        }
      ]

      const { data: createdEssays, error } = await supabase
        .from('user_application_essays')
        .insert(defaultEssays)
        .select()

      if (error) {
        console.error('Error creating default essays:', error)
        return
      }

      const formattedEssays = createdEssays.map(essay => ({
        id: essay.id,
        title: essay.essay_title,
        prompt: essay.essay_prompt,
        max_word_limit: essay.max_word_limit,
        content: essay.content,
        updated_at: essay.updated_at
      }))

      setEssays(formattedEssays)
    } catch (error) {
      console.error('Error creating default essays:', error)
    }
  }



  const createDefaultLORs = async (progressId: string, userId: string) => {
    try {
      const defaultLORs = [
        {
          user_id: userId,
          application_progress_id: progressId,
          recommender_name: '',
          relationship_to_applicant: 'supervisor',
          status: 'pending_request'
        },
        {
          user_id: userId,
          application_progress_id: progressId,
          recommender_name: '',
          relationship_to_applicant: 'professor',
          status: 'pending_request'
        }
      ]

      const { data: createdLORs, error } = await supabase
        .from('user_application_lors')
        .insert(defaultLORs)
        .select()

      if (error) {
        console.error('Error creating default LORs:', error)
        return
      }

      const formattedLORs = createdLORs.map(lor => ({
        id: lor.id,
        recommender_name: '',
        recommender_title: '',
        recommender_organization: '',
        recommender_company: '',
        content: '',
        additional_content: '',
        status: lor.status
      }))

      setLors(formattedLORs)
    } catch (error) {
      console.error('Error creating default LORs:', error)
    }
  }

  // Auto-select first school when target schools are loaded
  useEffect(() => {
    if (targetSchools.length > 0 && !selectedSchool && !loading && !schoolContentLoading && dataLoaded) {
      handleSchoolSelect(targetSchools[0])
    }
  }, [targetSchools, selectedSchool, loading, schoolContentLoading, dataLoaded])

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="pb-2">
          <h1 className="text-3xl font-bold tracking-tight">Application Manager</h1>
          <p className="text-muted-foreground mt-1">
            Manage your essays and letters of recommendation for target schools
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* School Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-fit border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Target Schools
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 max-h-[650px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading schools...</span>
                  </div>
                ) : targetSchools.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No target schools found.</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Add schools from the Schools page first.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {targetSchools.map((school, index) => {
                      const progress = progressData[school.mba_school_id]
                      const overallProgress = progress?.overall_completion_percentage || 0
                      const isLast = index === targetSchools.length - 1
                      
                      return (
                        <SchoolListItem
                          key={school.id}
                          school={school}
                          isSelected={selectedSchool?.id === school.id}
                          onClick={() => handleSchoolSelect(school)}
                          progress={overallProgress}
                          isLast={isLast}
                        />
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content Management Area */}
          <div className="lg:col-span-3">
            {schoolContentLoading ? (
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading school content...</p>
                </div>
              </Card>
            ) : selectedSchool ? (
              <div className="space-y-4">
                {/* School Info Bar */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <div>
                    <h2 className="font-semibold text-lg">{selectedSchool.school_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedSchool.location} • {selectedSchool.target_category || 'Target'} • Priority: {selectedSchool.priority_score || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Essays: {essays.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      LORs: {lors.length}
                    </span>
                  </div>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="essays" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="essays" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Essays
                    </TabsTrigger>
                    <TabsTrigger value="lors" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Letters of Rec
                    </TabsTrigger>
                    <TabsTrigger value="other" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Other Content
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="essays" className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h3 className="text-sm font-semibold text-foreground">Essays ({essays.length})</h3>
                      <div className="flex gap-2">
                        <Button onClick={() => setShowAddEssayDialog(true)} variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Essay
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {essays.map((essay) => (
                        <Card key={essay.id} className="border-border/50">
                          <CardContent className="p-4">
                            <EssayEditor 
                              essay={essay} 
                              onSave={handleSaveEssay}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="lors" className="space-y-4">
                    <div className="pb-2 border-b">
                      <h3 className="text-sm font-semibold text-foreground">Letters of Recommendation ({lors.length})</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {lors.map((lor, index) => (
                        <Card key={lor.id} className="border-border/50">
                          <CardContent className="p-4">
                            <LORSimpleEditor 
                              lor={{...lor, title: `LOR ${index + 1}`}}
                              onSave={handleSaveLOR}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="other" className="space-y-4">
                    <div className="pb-2 border-b">
                      <h3 className="text-sm font-semibold text-foreground">Other Content</h3>
                    </div>
                    
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Additional Materials</h3>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Save className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="other-content" className="text-xs font-medium">Content</Label>
                            <Textarea
                              id="other-content"
                              value={otherContent}
                              onChange={(e) => setOtherContent(e.target.value)}
                              placeholder="Add any other required content, supplementary materials info, etc..."
                              className="min-h-[160px] text-sm resize-none mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center space-y-2">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Select a school to get started</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Choose one of your target schools to start managing essays and recommendations
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

      </div>

      {/* Add Essay Dialog */}
      <AddEssayDialog 
        open={showAddEssayDialog}
        onOpenChange={setShowAddEssayDialog}
        onAdd={handleAddEssay}
      />
    </DashboardLayout>
  )
}