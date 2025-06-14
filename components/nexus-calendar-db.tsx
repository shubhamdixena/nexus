"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, X, Loader2, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";

// Types
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

interface NexusCalendarProps {
  className?: string;
}

// API functions
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

  async getSchoolDeadlines(startDate?: string, endDate?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    const response = await fetch(`/api/school-deadlines?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch school deadlines');
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

export function NexusCalendarDB({ className }: NexusCalendarProps) {
  const { user, loading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [schoolDeadlines, setSchoolDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [dialogDate, setDialogDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
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
  });

  const { toast } = useToast();

  // Load deadlines on component mount and when month changes
  useEffect(() => {
    if (!authLoading) {
      loadDeadlines();
    }
  }, [currentDate, authLoading]);

  const loadDeadlines = async () => {
    try {
      setLoading(true);
      setError(null);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      // Load personal deadlines (if user is authenticated)
      let personalDeadlines: Deadline[] = [];
      if (user) {
        try {
          personalDeadlines = await deadlineAPI.getDeadlines(
            format(monthStart, 'yyyy-MM-dd'),
            format(monthEnd, 'yyyy-MM-dd')
          );
          console.log('📝 Personal deadlines loaded:', personalDeadlines.length);
        } catch (error) {
          console.warn('Failed to load personal deadlines:', error);
        }
      }
      
      // Load school deadlines (available to everyone)
      let globalSchoolDeadlines: any[] = [];
      try {
        const startDate = format(monthStart, 'yyyy-MM-dd');
        const endDate = format(monthEnd, 'yyyy-MM-dd');
        console.log(`🏫 Loading school deadlines for ${startDate} to ${endDate}`);
        
        globalSchoolDeadlines = await deadlineAPI.getSchoolDeadlines(startDate, endDate);
        console.log('🏫 School deadlines loaded:', globalSchoolDeadlines.length);
        
        if (globalSchoolDeadlines.length > 0) {
          console.log('📊 First few school deadlines:', globalSchoolDeadlines.slice(0, 3));
          const dates = globalSchoolDeadlines.map(d => d.deadline_date).sort();
          console.log('📅 School deadline dates:', dates);
        } else {
          console.warn('⚠️ No school deadlines found for this month');
        }
      } catch (error) {
        console.warn('Failed to load school deadlines:', error);
      }
      
      setDeadlines(personalDeadlines);
      setSchoolDeadlines(globalSchoolDeadlines);
      console.log('📊 State updated - Personal:', personalDeadlines.length, 'School:', globalSchoolDeadlines.length);
    } catch (error) {
      console.error('Error loading deadlines:', error);
      setError(error instanceof Error ? error.message : 'Failed to load deadlines');
      toast({
        title: "Error",
        description: "Failed to load deadlines. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedDeadline) {
        // Update existing deadline
        await deadlineAPI.updateDeadline(selectedDeadline.id, formData);
        toast({
          title: "Success",
          description: "Deadline updated successfully!"
        });
      } else {
        // Create new deadline
        await deadlineAPI.createDeadline({
          ...formData,
          completed: false
        });
        toast({
          title: "Success",
          description: "Deadline created successfully!"
        });
      }
      setIsDialogOpen(false);
      setSelectedDeadline(null);
      resetForm();
      loadDeadlines();
    } catch (error) {
      console.error('Error saving deadline:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save deadline",
        variant: "destructive"
      });
    }
  };

  const handleToggleComplete = async (deadline: Deadline, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      await deadlineAPI.updateDeadline(deadline.id, {
        completed: !deadline.completed
      });
      loadDeadlines();
      toast({
        title: "Success",
        description: `Deadline marked as ${!deadline.completed ? 'completed' : 'incomplete'}`
      });
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast({
        title: "Error",
        description: "Failed to update deadline status",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (deadline: Deadline, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!confirm('Are you sure you want to delete this deadline?')) return;
    
    try {
      await deadlineAPI.deleteDeadline(deadline.id);
      loadDeadlines();
      toast({
        title: "Success",
        description: "Deadline deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting deadline:', error);
      toast({
        title: "Error",
        description: "Failed to delete deadline",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      deadline_type: "application",
      priority: "medium",
      deadline_date: "",
      notes: ""
    });
  };

  const openDialog = (date?: Date, deadline?: Deadline) => {
    if (deadline) {
      // Editing a specific deadline
      setSelectedDeadline(deadline);
      setDialogDate(null);
      setShowForm(true);
      setFormData({
        title: deadline.title,
        deadline_type: deadline.deadline_type,
        priority: deadline.priority,
        deadline_date: deadline.deadline_date,
        notes: deadline.notes || ""
      });
    } else if (date) {
      // Clicked on a date - check if it has deadlines
      const dateDeadlines = getDeadlinesForDate(date);
      setDialogDate(date);
      setSelectedDeadline(null);
      
      if (dateDeadlines.length > 0) {
        // Show existing deadlines first
        setShowForm(false);
      } else {
        // No deadlines, show form directly
        setShowForm(true);
        resetForm();
        setFormData(prev => ({
          ...prev,
          deadline_date: format(date, 'yyyy-MM-dd')
        }));
      }
    } else {
      // Add new deadline (from header button)
      setSelectedDeadline(null);
      setDialogDate(null);
      setShowForm(true);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getDeadlinesForDate = (date: Date) => {
    // Combine personal deadlines and school deadlines
    const personalDeadlinesForDate = deadlines.filter(deadline => 
      isSameDay(new Date(deadline.deadline_date), date)
    );
    
    const schoolDeadlinesForDate = schoolDeadlines.filter(deadline => 
      isSameDay(new Date(deadline.deadline_date), date)
    ).map(deadline => ({
      ...deadline,
      isSchoolDeadline: true,
      // Convert to match our deadline interface
      id: deadline.id,
      title: deadline.title,
      deadline_type: deadline.deadline_type,
      priority: deadline.priority,
      deadline_date: deadline.deadline_date,
      notes: deadline.notes,
      completed: false, // School deadlines can't be marked complete
      source_type: 'school_deadline' as const
    }));
    
    const combined = [...personalDeadlinesForDate, ...schoolDeadlinesForDate];
    
    // Debug log for dates that should have deadlines in September 2025
    const dateStr = format(date, 'yyyy-MM-dd');
    const expectedSeptemberDates = ['2025-09-02', '2025-09-03', '2025-09-04', '2025-09-05', '2025-09-10', '2025-09-11', '2025-09-12', '2025-09-18', '2025-09-19', '2025-09-24', '2025-09-30'];
    if (expectedSeptemberDates.includes(dateStr)) {
      console.log(`🗓️ Deadlines for ${dateStr}:`, combined);
      console.log(`  📝 Personal: ${personalDeadlinesForDate.length}, 🏫 School: ${schoolDeadlinesForDate.length}`);
    }
    
    return combined;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "application": return "bg-red-500";
      case "scholarship": return "bg-blue-500";
      case "test": return "bg-green-500";
      case "interview": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Show loading state if auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Note: We now show school deadlines to everyone, authentication only needed for personal deadlines

  return (
    <div className={cn("w-full", className)}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              NEXUS Education Calendar
            </CardTitle>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()} disabled={!user}>
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Add Deadline</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {showForm ? 
                      (selectedDeadline ? "Edit Deadline" : "Add New Deadline") :
                      `Deadlines for ${dialogDate ? format(dialogDate, 'MMMM d, yyyy') : ''}`
                    }
                  </DialogTitle>
                </DialogHeader>
                
                {!showForm && dialogDate && (
                  <div className="space-y-4">
                    {getDeadlinesForDate(dialogDate).map((deadline) => {
                      const isSchoolDeadline = (deadline as any).isSchoolDeadline;
                      const isPersonalDeadline = !isSchoolDeadline;
                      
                      return (
                        <div
                          key={deadline.id}
                          className={cn(
                            "p-3 rounded-lg border",
                            isSchoolDeadline && "border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/30"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {isSchoolDeadline && deadline.school_name ? 
                                  deadline.school_name : 
                                  deadline.title
                                }
                              </div>
                              {isSchoolDeadline && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {deadline.title}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {deadline.deadline_type}
                                </Badge>
                                {isSchoolDeadline && (
                                  <Badge variant="secondary" className="text-xs">
                                    School
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {isPersonalDeadline && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    openDialog(undefined, deadline);
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleComplete(deadline)}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {deadline.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(deadline)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="pt-2">
                      <Button 
                        onClick={() => {
                          setShowForm(true);
                          resetForm();
                          setFormData(prev => ({
                            ...prev,
                            deadline_date: format(dialogDate, 'yyyy-MM-dd')
                          }));
                        }}
                        className="w-full"
                        disabled={!user}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Deadline
                      </Button>
                      {!user && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Sign in to add personal deadlines
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {showForm && (
                  <>
                    {!user && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Please sign in to create and manage your personal deadlines. 
                          School deadlines are visible to everyone.
                        </p>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter deadline title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deadline_date">Date *</Label>
                    <Input
                      id="deadline_date"
                      type="date"
                      value={formData.deadline_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline_date: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="deadline_type">Type</Label>
                    <Select
                      value={formData.deadline_type}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, deadline_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="application">📝 Application</SelectItem>
                        <SelectItem value="scholarship">💰 Scholarship</SelectItem>
                        <SelectItem value="test">📊 Test</SelectItem>
                        <SelectItem value="interview">🎤 Interview</SelectItem>
                        <SelectItem value="reminder">⏰ Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🔴 High Priority</SelectItem>
                        <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                        <SelectItem value="low">🟢 Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any additional notes..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {selectedDeadline ? "Update" : "Create"} Deadline
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  {selectedDeadline && (
                    <>
                      <hr />
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={(e) => {
                          handleDelete(selectedDeadline, e);
                          setIsDialogOpen(false);
                        }}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Deadline
                      </Button>
                    </>
                  )}
                </form>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Prev</span>
            </Button>
            <h2 className="text-lg sm:text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center h-32 text-center">
              <div>
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" onClick={loadDeadlines} className="mt-2">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading deadlines...</span>
            </div>
          )}

          {/* Calendar Grid */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground p-2">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
                
                {calendarDays.map((day, index) => {
                  const dayDeadlines = getDeadlinesForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);

                  return (
                    <div
                      key={index}
                      className={cn(
                        "min-h-[60px] sm:min-h-[80px] p-1 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                        !isCurrentMonth && "text-muted-foreground bg-muted/30",
                        isTodayDate && "bg-primary/10 border-primary ring-1 ring-primary"
                      )}
                      onClick={() => openDialog(day)}
                    >
                      <div className="text-xs sm:text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayDeadlines.slice(0, 2).map((deadline) => {
                          const isSchoolDeadline = (deadline as any).isSchoolDeadline;
                          const isPersonalDeadline = !isSchoolDeadline;
                          
                          return (
                            <div key={deadline.id} className="relative group">
                              <div
                                className={cn(
                                  "text-xs p-1 rounded text-white truncate cursor-pointer relative",
                                  getTypeColor(deadline.deadline_type),
                                  deadline.completed && "opacity-50 line-through",
                                  isSchoolDeadline && "border border-white/30", // Distinguish school deadlines
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isPersonalDeadline) {
                                    openDialog(day, deadline);
                                  } else {
                                    // For school deadlines, show info or allow creating personal copy
                                    toast({
                                      title: deadline.title,
                                      description: `${deadline.notes || 'School deadline'} - Click "Add Deadline" to create your personal copy.`,
                                      duration: 4000
                                    });
                                  }
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="truncate flex-1">
                                    {isSchoolDeadline && "🏫 "}
                                    {deadline.title}
                                  </span>
                                  {isPersonalDeadline && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40"
                                        >
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem onClick={(e) => handleToggleComplete(deadline, e)}>
                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                          {deadline.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation();
                                          openDialog(day, deadline);
                                        }}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={(e) => handleDelete(deadline, e)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {dayDeadlines.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayDeadlines.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="hidden sm:inline">Application</span>
                    <span className="sm:hidden">App</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="hidden sm:inline">Scholarship</span>
                    <span className="sm:hidden">Sch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Test</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="hidden sm:inline">Interview</span>
                    <span className="sm:hidden">Int</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded"></div>
                    <span className="hidden sm:inline">Reminder</span>
                    <span className="sm:hidden">Rem</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-2">
                  <div className="flex items-center gap-2">
                    <span>🏫</span>
                    <span>School Deadlines (for all users)</span>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2">
                      <span>📝</span>
                      <span>Your Personal Deadlines</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Empty state */}
              {deadlines.length === 0 && schoolDeadlines.length === 0 && (
                <div className="text-center py-8 mt-6">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Deadlines This Month</h3>
                  <p className="text-muted-foreground mb-4">
                    School deadlines are automatically loaded. You can also add your personal deadlines.
                  </p>
                  <Button onClick={() => openDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Personal Deadline
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}