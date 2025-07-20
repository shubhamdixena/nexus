"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Brain, Settings, School, MessageSquare, Plus, Edit2, Trash2, Save, X, Users, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

interface AgentConfig {
  id: string
  foundational_prompt: string
  evaluation_criteria: string
  conversation_guidelines: string
  max_conversation_turns: number
  created_at: string
  updated_at: string
}

interface SchoolPersona {
  id: string
  school_id: string
  interviewer_name: string
  interviewer_title: string
  tone: 'friendly' | 'formal' | 'analytical' | 'warm_professional'
  background: string
  greeting: string
  closing: string
  school_context: string
  behavioral_notes: string
  is_active: boolean
  created_at: string
  updated_at: string
  mba_schools?: {
    business_school: string
    location: string
  }
}

interface QuestionBank {
  id: string
  school_id: string
  question_text: string
  question_category: string
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
  mba_schools?: {
    business_school: string
  }
}

interface MBASchool {
  id: string
  business_school: string
  location: string
}

export function AdminAIInterviewManagement() {
  const [loading, setLoading] = useState(true)
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([])
  const [schoolPersonas, setSchoolPersonas] = useState<SchoolPersona[]>([])
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([])
  const [mbaSchools, setMbaSchools] = useState<MBASchool[]>([])
  const [activeTab, setActiveTab] = useState("config")

  // Dialog states
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AgentConfig | null>(null)
  const [editingPersona, setEditingPersona] = useState<SchoolPersona | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<QuestionBank | null>(null)

  const { toast } = useToast()

  // Form states
  const [configForm, setConfigForm] = useState({
    foundational_prompt: '',
    evaluation_criteria: '',
    conversation_guidelines: '',
    max_conversation_turns: 20
  })

  const [personaForm, setPersonaForm] = useState({
    school_id: '',
    interviewer_name: '',
    interviewer_title: '',
    tone: 'warm_professional' as const,
    background: '',
    greeting: '',
    closing: '',
    school_context: '',
    behavioral_notes: '',
    is_active: true
  })

  const [questionForm, setQuestionForm] = useState({
    school_id: '',
    question_text: '',
    question_category: 'general',
    priority: 1,
    is_active: true
  })

  // Load data on component mount
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadAgentConfigs(),
        loadSchoolPersonas(),
        loadQuestionBanks(),
        loadMBASchools()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load AI interview data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAgentConfigs = async () => {
    const response = await fetch('/api/admin/ai-interview-agent-config')
    if (response.ok) {
      const result = await response.json()
      setAgentConfigs(result.data || [])
    }
  }

  const loadSchoolPersonas = async () => {
    const response = await fetch('/api/admin/ai-interview-school-personas')
    if (response.ok) {
      const result = await response.json()
      setSchoolPersonas(result.data || [])
    }
  }

  const loadQuestionBanks = async () => {
    const response = await fetch('/api/admin/ai-interview-question-banks')
    if (response.ok) {
      const result = await response.json()
      setQuestionBanks(result.data || [])
    }
  }

  const loadMBASchools = async () => {
    const response = await fetch('/api/admin/mba-schools?limit=100')
    if (response.ok) {
      const result = await response.json()
      setMbaSchools(result.data || [])
    }
  }

  // Agent Config handlers
  const handleSaveConfig = async () => {
    try {
      const method = editingConfig ? 'PUT' : 'POST'
      const body = editingConfig 
        ? { ...configForm, id: editingConfig.id }
        : configForm

      const response = await fetch('/api/admin/ai-interview-agent-config', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await loadAgentConfigs()
        setIsConfigDialogOpen(false)
        resetConfigForm()
        toast({
          title: 'Success',
          description: `Agent configuration ${editingConfig ? 'updated' : 'created'} successfully`
        })
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save agent configuration',
        variant: 'destructive'
      })
    }
  }

  const handleEditConfig = (config: AgentConfig) => {
    setEditingConfig(config)
    setConfigForm({
      foundational_prompt: config.foundational_prompt,
      evaluation_criteria: config.evaluation_criteria,
      conversation_guidelines: config.conversation_guidelines,
      max_conversation_turns: config.max_conversation_turns
    })
    setIsConfigDialogOpen(true)
  }

  const resetConfigForm = () => {
    setEditingConfig(null)
    setConfigForm({
      foundational_prompt: '',
      evaluation_criteria: '',
      conversation_guidelines: '',
      max_conversation_turns: 20
    })
  }

  // School Persona handlers
  const handleSavePersona = async () => {
    try {
      const method = editingPersona ? 'PUT' : 'POST'
      const body = editingPersona 
        ? { ...personaForm, id: editingPersona.id }
        : personaForm

      const response = await fetch('/api/admin/ai-interview-school-personas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await loadSchoolPersonas()
        setIsPersonaDialogOpen(false)
        resetPersonaForm()
        toast({
          title: 'Success',
          description: `School persona ${editingPersona ? 'updated' : 'created'} successfully`
        })
      } else {
        throw new Error('Failed to save persona')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save school persona',
        variant: 'destructive'
      })
    }
  }

  const handleEditPersona = (persona: SchoolPersona) => {
    setEditingPersona(persona)
    setPersonaForm({
      school_id: persona.school_id,
      interviewer_name: persona.interviewer_name,
      interviewer_title: persona.interviewer_title,
      tone: persona.tone,
      background: persona.background,
      greeting: persona.greeting,
      closing: persona.closing,
      school_context: persona.school_context,
      behavioral_notes: persona.behavioral_notes,
      is_active: persona.is_active
    })
    setIsPersonaDialogOpen(true)
  }

  const resetPersonaForm = () => {
    setEditingPersona(null)
    setPersonaForm({
      school_id: '',
      interviewer_name: '',
      interviewer_title: '',
      tone: 'warm_professional',
      background: '',
      greeting: '',
      closing: '',
      school_context: '',
      behavioral_notes: '',
      is_active: true
    })
  }

  // Question Bank handlers
  const handleSaveQuestion = async () => {
    try {
      const method = editingQuestion ? 'PUT' : 'POST'
      const body = editingQuestion 
        ? { ...questionForm, id: editingQuestion.id }
        : questionForm

      const response = await fetch('/api/admin/ai-interview-question-banks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await loadQuestionBanks()
        setIsQuestionDialogOpen(false)
        resetQuestionForm()
        toast({
          title: 'Success',
          description: `Question ${editingQuestion ? 'updated' : 'created'} successfully`
        })
      } else {
        throw new Error('Failed to save question')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save question',
        variant: 'destructive'
      })
    }
  }

  const handleEditQuestion = (question: QuestionBank) => {
    setEditingQuestion(question)
    setQuestionForm({
      school_id: question.school_id,
      question_text: question.question_text,
      question_category: question.question_category,
      priority: question.priority,
      is_active: question.is_active
    })
    setIsQuestionDialogOpen(true)
  }

  const resetQuestionForm = () => {
    setEditingQuestion(null)
    setQuestionForm({
      school_id: '',
      question_text: '',
      question_category: 'general',
      priority: 1,
      is_active: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading AI interview management...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Interview Management
          </h2>
          <p className="text-gray-600">Configure AI interviewer behavior, school personas, and question banks</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Agent Config
          </TabsTrigger>
          <TabsTrigger value="personas" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            School Personas
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Question Banks
          </TabsTrigger>
        </TabsList>

        {/* Agent Configuration Tab */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Global Agent Configuration</CardTitle>
                  <CardDescription>
                    Configure the foundational behavior and settings for the AI interviewer
                  </CardDescription>
                </div>
                <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetConfigForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Configuration
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingConfig ? 'Edit' : 'Create'} Agent Configuration
                      </DialogTitle>
                      <DialogDescription>
                        Define the global settings that control how the AI interviewer behaves
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="foundational_prompt">Foundational Prompt</Label>
                        <Textarea
                          id="foundational_prompt"
                          value={configForm.foundational_prompt}
                          onChange={(e) => setConfigForm(prev => ({ ...prev, foundational_prompt: e.target.value }))}
                          placeholder="Core instructions for the AI interviewer..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="evaluation_criteria">Evaluation Criteria</Label>
                        <Textarea
                          id="evaluation_criteria"
                          value={configForm.evaluation_criteria}
                          onChange={(e) => setConfigForm(prev => ({ ...prev, evaluation_criteria: e.target.value }))}
                          placeholder="What the interviewer should evaluate..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="conversation_guidelines">Conversation Guidelines</Label>
                        <Textarea
                          id="conversation_guidelines"
                          value={configForm.conversation_guidelines}
                          onChange={(e) => setConfigForm(prev => ({ ...prev, conversation_guidelines: e.target.value }))}
                          placeholder="How the conversation should flow..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_conversation_turns">Max Conversation Turns</Label>
                        <Input
                          id="max_conversation_turns"
                          type="number"
                          value={configForm.max_conversation_turns}
                          onChange={(e) => setConfigForm(prev => ({ ...prev, max_conversation_turns: parseInt(e.target.value) }))}
                          min="5"
                          max="50"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveConfig}>
                        {editingConfig ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {agentConfigs.length > 0 ? (
                <div className="space-y-4">
                  {agentConfigs.map(config => (
                    <div key={config.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div>
                            <Label className="text-sm font-medium">Foundational Prompt</Label>
                            <p className="text-sm text-gray-600">{config.foundational_prompt.slice(0, 200)}...</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Max Turns</Label>
                            <p className="text-sm text-gray-600">{config.max_conversation_turns}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditConfig(config)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No agent configurations found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* School Personas Tab */}
        <TabsContent value="personas">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>School-Specific Personas</CardTitle>
                  <CardDescription>
                    Create unique interviewer personalities for each MBA school
                  </CardDescription>
                </div>
                <Dialog open={isPersonaDialogOpen} onOpenChange={setIsPersonaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetPersonaForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Persona
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPersona ? 'Edit' : 'Create'} School Persona
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="school_id">MBA School</Label>
                        <Select
                          value={personaForm.school_id}
                          onValueChange={(value) => setPersonaForm(prev => ({ ...prev, school_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a school" />
                          </SelectTrigger>
                          <SelectContent>
                            {mbaSchools.map(school => (
                              <SelectItem key={school.id} value={school.id}>
                                {school.business_school}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="interviewer_name">Interviewer Name</Label>
                          <Input
                            id="interviewer_name"
                            value={personaForm.interviewer_name}
                            onChange={(e) => setPersonaForm(prev => ({ ...prev, interviewer_name: e.target.value }))}
                            placeholder="Dr. Sarah Mitchell"
                          />
                        </div>
                        <div>
                          <Label htmlFor="interviewer_title">Title</Label>
                          <Input
                            id="interviewer_title"
                            value={personaForm.interviewer_title}
                            onChange={(e) => setPersonaForm(prev => ({ ...prev, interviewer_title: e.target.value }))}
                            placeholder="Senior Admissions Director"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="tone">Interview Tone</Label>
                        <Select
                          value={personaForm.tone}
                          onValueChange={(value: any) => setPersonaForm(prev => ({ ...prev, tone: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="analytical">Analytical</SelectItem>
                            <SelectItem value="warm_professional">Warm Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="background">Interviewer Background</Label>
                        <Textarea
                          id="background"
                          value={personaForm.background}
                          onChange={(e) => setPersonaForm(prev => ({ ...prev, background: e.target.value }))}
                          placeholder="Brief background about the interviewer..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="greeting">Opening Greeting</Label>
                        <Textarea
                          id="greeting"
                          value={personaForm.greeting}
                          onChange={(e) => setPersonaForm(prev => ({ ...prev, greeting: e.target.value }))}
                          placeholder="How the interviewer will greet candidates..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="closing">Closing Statement</Label>
                        <Textarea
                          id="closing"
                          value={personaForm.closing}
                          onChange={(e) => setPersonaForm(prev => ({ ...prev, closing: e.target.value }))}
                          placeholder="How the interviewer will end the conversation..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="school_context">School Context</Label>
                        <Textarea
                          id="school_context"
                          value={personaForm.school_context}
                          onChange={(e) => setPersonaForm(prev => ({ ...prev, school_context: e.target.value }))}
                          placeholder="Context about the school's values and culture..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="behavioral_notes">Behavioral Notes</Label>
                        <Textarea
                          id="behavioral_notes"
                          value={personaForm.behavioral_notes}
                          onChange={(e) => setPersonaForm(prev => ({ ...prev, behavioral_notes: e.target.value }))}
                          placeholder="How this interviewer should behave during conversations..."
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={personaForm.is_active}
                          onCheckedChange={(checked) => setPersonaForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPersonaDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSavePersona}>
                        {editingPersona ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {schoolPersonas.length > 0 ? (
                <div className="space-y-4">
                  {schoolPersonas.map(persona => (
                    <div key={persona.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{persona.interviewer_name}</h3>
                            <Badge variant={persona.is_active ? "default" : "secondary"}>
                              {persona.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{persona.tone}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{persona.interviewer_title}</p>
                          <p className="text-sm text-gray-600">
                            {persona.mba_schools?.business_school || 'Unknown School'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPersona(persona)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No school personas found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Question Banks Tab */}
        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Question Banks</CardTitle>
                  <CardDescription>
                    Manage school-specific interview questions
                  </CardDescription>
                </div>
                <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetQuestionForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingQuestion ? 'Edit' : 'Create'} Interview Question
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="school_id">MBA School</Label>
                        <Select
                          value={questionForm.school_id}
                          onValueChange={(value) => setQuestionForm(prev => ({ ...prev, school_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a school" />
                          </SelectTrigger>
                          <SelectContent>
                            {mbaSchools.map(school => (
                              <SelectItem key={school.id} value={school.id}>
                                {school.business_school}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="question_text">Question Text</Label>
                        <Textarea
                          id="question_text"
                          value={questionForm.question_text}
                          onChange={(e) => setQuestionForm(prev => ({ ...prev, question_text: e.target.value }))}
                          placeholder="Tell me about a time when you demonstrated leadership..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="question_category">Category</Label>
                          <Select
                            value={questionForm.question_category}
                            onValueChange={(value) => setQuestionForm(prev => ({ ...prev, question_category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="leadership">Leadership</SelectItem>
                              <SelectItem value="analytical">Analytical</SelectItem>
                              <SelectItem value="teamwork">Teamwork</SelectItem>
                              <SelectItem value="goals">Goals & Motivation</SelectItem>
                              <SelectItem value="ethics">Ethics</SelectItem>
                              <SelectItem value="school-specific">School-Specific</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority (1-10)</Label>
                          <Input
                            id="priority"
                            type="number"
                            value={questionForm.priority}
                            onChange={(e) => setQuestionForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                            min="1"
                            max="10"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={questionForm.is_active}
                          onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveQuestion}>
                        {editingQuestion ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {questionBanks.length > 0 ? (
                <div className="space-y-4">
                  {questionBanks.map(question => (
                    <div key={question.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{question.question_category}</Badge>
                            <Badge variant={question.is_active ? "default" : "secondary"}>
                              {question.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm text-gray-500">Priority: {question.priority}</span>
                          </div>
                          <p className="text-sm">{question.question_text}</p>
                          <p className="text-xs text-gray-500">
                            {question.mba_schools?.business_school || 'Unknown School'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No questions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 