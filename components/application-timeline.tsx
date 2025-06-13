"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Check, Clock, Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { ReportDataButton } from "@/components/report-data-button"

// Types matching the database schema
interface Deadline {
  id: string;
  title: string;
  deadline_type: "application" | "scholarship" | "test" | "reminder" | "interview";
  priority: "high" | "medium" | "low";
  deadline_date: string; // ISO date string
  notes?: string;
  completed: boolean;
  completed_at?: string;
  source_type?: "manual" | "school_bookmark" | "scholarship_save" | "auto_test";
  source_id?: string;
  created_at: string;
  updated_at: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  deadline_type: string;
  completed: boolean;
  deadline_date?: string;
}

// API functions for deadlines
const deadlineAPI = {
  async getDeadlines(startDate?: string, endDate?: string): Promise<Deadline[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    const response = await fetch(`/api/deadlines?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch deadlines');
    }
    const data = await response.json();
    return data.deadlines;
  },

  async createDeadline(deadline: Omit<Deadline, 'id' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<Deadline> {
    const response = await fetch('/api/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deadline)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create deadline');
    }
    const data = await response.json();
    return data.deadline;
  },

  async updateDeadline(id: string, updates: Partial<Deadline>): Promise<Deadline> {
    const response = await fetch(`/api/deadlines/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update deadline');
    }
    const data = await response.json();
    return data.deadline;
  },

  async deleteDeadline(id: string): Promise<void> {
    const response = await fetch(`/api/deadlines/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete deadline');
    }
  }
};

export function ApplicationTimeline() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  
  // State management
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddEventDialog, setShowAddEventDialog] = useState(false)
  const [filterUniversity, setFilterUniversity] = useState<string | null>(null)
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data for add/edit dialog
  const [formData, setFormData] = useState<{
    title: string;
    deadline_type: "application" | "scholarship" | "test" | "reminder" | "interview";
    priority: "high" | "medium" | "low";
    deadline_date: string;
    notes: string;
  }>({
    title: "",
    deadline_type: "application",
    priority: "medium",
    deadline_date: "",
    notes: ""
  })

  // Load deadlines from API
  const loadDeadlines = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true)
      setError(null)
      const data = await deadlineAPI.getDeadlines()
      setDeadlines(data)
    } catch (err) {
      console.error('Error loading deadlines:', err)
      setError(err instanceof Error ? err.message : 'Failed to load deadlines')
      toast({
        title: "Error",
        description: "Failed to load deadlines. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  // Load deadlines on component mount and when user changes
  useEffect(() => {
    if (user && !authLoading) {
      loadDeadlines()
    }
  }, [user, authLoading, loadDeadlines])

  // Handle form submission for add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.deadline_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (selectedDeadline) {
        // Update existing deadline
        await deadlineAPI.updateDeadline(selectedDeadline.id, formData)
        toast({
          title: "Success",
          description: "Timeline event updated successfully!"
        })
      } else {
        // Create new deadline
        await deadlineAPI.createDeadline({
          ...formData,
          completed: false
        })
        toast({
          title: "Success",
          description: "Timeline event created successfully!"
        })
      }
      setShowAddEventDialog(false)
      setSelectedDeadline(null)
      resetForm()
      loadDeadlines()
    } catch (err) {
      console.error('Error saving deadline:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save timeline event",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: "",
      deadline_type: "application",
      priority: "medium",
      deadline_date: "",
      notes: ""
    })
  }

  // Handle edit event
  const handleEditEvent = (deadline: Deadline) => {
    setSelectedDeadline(deadline)
    setFormData({
      title: deadline.title,
      deadline_type: deadline.deadline_type,
      priority: deadline.priority,
      deadline_date: deadline.deadline_date,
      notes: deadline.notes || ""
    })
    setShowAddEventDialog(true)
  }

  // Handle toggle completion
  const handleToggleComplete = async (deadline: Deadline) => {
    try {
      await deadlineAPI.updateDeadline(deadline.id, {
        completed: !deadline.completed
      })
      loadDeadlines()
      toast({
        title: "Success",
        description: `Event marked as ${!deadline.completed ? 'completed' : 'incomplete'}`
      })
    } catch (err) {
      console.error('Error updating deadline:', err)
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive"
      })
    }
  }

  // Handle delete event
  const handleDeleteEvent = async (deadline: Deadline) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      await deadlineAPI.deleteDeadline(deadline.id)
      loadDeadlines()
      toast({
        title: "Success",
        description: "Event deleted successfully"
      })
    } catch (err) {
      console.error('Error deleting deadline:', err)
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      })
    }
  }

  // Filter events based on selected criteria
  const filteredEvents = deadlines.filter(deadline => {
    if (!filterUniversity) return true
    // For filtering, we'll use deadline_type as a proxy for university/category
    return deadline.deadline_type === filterUniversity
  })

  // Get unique deadline types for filtering
  const deadlineTypes = Array.from(new Set(deadlines.map(d => d.deadline_type)))

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-lg">Unable to load timeline</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={loadDeadlines} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show auth required state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Authentication Required</CardTitle>
            <CardDescription>Please log in to view your application timeline</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {selectedDeadline ? 'Edit Timeline Event' : 'Add Timeline Event'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedDeadline ? 'Update your timeline event.' : 'Add a new event to your application timeline.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Event Title *</Label>
                    <Input 
                      id="event-title" 
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Date *</Label>
                    <Input 
                      id="event-date" 
                      type="date"
                      value={formData.deadline_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select 
                      value={formData.deadline_type}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, deadline_type: value }))}
                    >
                      <SelectTrigger id="event-type">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="application">Application Deadline</SelectItem>
                        <SelectItem value="scholarship">Scholarship</SelectItem>
                        <SelectItem value="test">Test/Exam</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-priority">Priority</Label>
                    <Select 
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger id="event-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-description">Notes (Optional)</Label>
                    <Textarea 
                      id="event-description" 
                      placeholder="Enter notes or description"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddEventDialog(false)
                      setSelectedDeadline(null)
                      resetForm()
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {selectedDeadline ? 'Update Event' : 'Add Event'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Select 
            value={filterUniversity || "all"} 
            onValueChange={(value) => setFilterUniversity(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {deadlineTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="mb-6">
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="checklist">Checklist View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No events found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {deadlines.length === 0 
                      ? "Start by adding your first timeline event"
                      : "Try changing your filter criteria"
                    }
                  </p>
                  <Button onClick={() => setShowAddEventDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Event
                  </Button>
                </div>
              ) : (
                <div className="relative space-y-8 pl-8 pt-2 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-muted">
                  {filteredEvents
                    .sort((a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime())
                    .map((deadline) => (
                      <TimelineEvent 
                        key={deadline.id} 
                        deadline={deadline} 
                        onEdit={handleEditEvent}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteEvent}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Checklist</CardTitle>
              <CardDescription>Track your application requirements by type</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {deadlineTypes.map((type) => {
                  const typeDeadlines = deadlines.filter(d => d.deadline_type === type)
                  return (
                    <div key={type} className="space-y-3">
                      <h3 className="font-medium capitalize">{type} ({typeDeadlines.length})</h3>
                      <div className="space-y-2">
                        {typeDeadlines.map((deadline) => (
                          <div key={deadline.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
                            <Checkbox
                              id={deadline.id}
                              checked={deadline.completed}
                              onCheckedChange={() => handleToggleComplete(deadline)}
                            />
                            <Label 
                              htmlFor={deadline.id} 
                              className={`text-sm flex-1 cursor-pointer ${deadline.completed ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {deadline.title}
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {new Date(deadline.deadline_date).toLocaleDateString()}
                            </span>
                            <Badge variant={getPriorityVariant(deadline.priority)} className="text-xs">
                              {deadline.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {deadlineTypes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No deadlines to show in checklist</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TimelineEventProps {
  deadline: Deadline
  onEdit: (deadline: Deadline) => void
  onToggleComplete: (deadline: Deadline) => void
  onDelete: (deadline: Deadline) => void
}

function TimelineEvent({ deadline, onEdit, onToggleComplete, onDelete }: TimelineEventProps) {
  const eventDate = new Date(deadline.deadline_date)
  const currentDate = new Date()
  const isPast = eventDate < currentDate
  const isToday = eventDate.toDateString() === currentDate.toDateString()

  return (
    <div className="relative group">
      <div
        className={`absolute -left-10 flex h-6 w-6 items-center justify-center rounded-full ${
          deadline.completed
            ? "bg-green-500 text-white"
            : isPast
            ? "bg-red-500 text-white"
            : isToday
              ? "bg-yellow-500 text-white"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {deadline.completed ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${deadline.completed ? 'line-through text-muted-foreground' : ''}`}>
              {deadline.title}
            </h3>
            <Badge variant={getTypeVariant(deadline.deadline_type)} className="text-xs">
              {deadline.deadline_type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {eventDate.toLocaleDateString()} • Priority: {deadline.priority}
          </p>
          {deadline.notes && (
            <p className="mt-1 text-sm text-muted-foreground">{deadline.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleComplete(deadline)}
          >
            {deadline.completed ? 'Mark Incomplete' : 'Mark Complete'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(deadline)}
          >
            Edit
          </Button>
          <ReportDataButton 
            dataType="deadline"
            dataId={deadline.id}
            dataTable="deadlines"
            currentData={deadline}
            variant="outline"
            size="sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(deadline)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

function getTypeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "application":
      return "destructive"
    case "scholarship":
      return "default"
    case "test":
      return "secondary"
    case "interview":
      return "outline"
    case "reminder":
      return "outline"
    default:
      return "outline"
  }
}

function getPriorityVariant(priority: string): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case "high":
      return "destructive"
    case "medium":
      return "default"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}
