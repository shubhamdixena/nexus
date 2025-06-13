"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    deadline_type: "application" as const,
    priority: "medium" as const,
    deadline_date: "",
    notes: ""
  });

  const { toast } = useToast();

  // Load deadlines on component mount and when month changes
  useEffect(() => {
    loadDeadlines();
  }, [currentDate]);

  const loadDeadlines = async () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const data = await deadlineAPI.getDeadlines(
        format(monthStart, 'yyyy-MM-dd'),
        format(monthEnd, 'yyyy-MM-dd')
      );
      setDeadlines(data);
    } catch (error) {
      console.error('Error loading deadlines:', error);
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

  const handleToggleComplete = async (deadline: Deadline) => {
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

  const handleDelete = async (deadline: Deadline) => {
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
      setSelectedDeadline(deadline);
      setFormData({
        title: deadline.title,
        deadline_type: deadline.deadline_type,
        priority: deadline.priority,
        deadline_date: deadline.deadline_date,
        notes: deadline.notes || ""
      });
    } else {
      setSelectedDeadline(null);
      resetForm();
      if (date) {
        setFormData(prev => ({
          ...prev,
          deadline_date: format(date, 'yyyy-MM-dd')
        }));
      }
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
    return deadlines.filter(deadline => 
      isSameDay(new Date(deadline.deadline_date), date)
    );
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

  return (
    <div className={cn("w-full", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              NEXUS Education Calendar
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deadline
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {selectedDeadline ? "Edit Deadline" : "Add New Deadline"}
                  </DialogTitle>
                </DialogHeader>
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
                        <SelectItem value="application">Application</SelectItem>
                        <SelectItem value="scholarship">Scholarship</SelectItem>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
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
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
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
                </form>
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
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading deadlines...</span>
            </div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
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
                        "min-h-[80px] p-1 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                        !isCurrentMonth && "text-muted-foreground bg-muted/30",
                        isTodayDate && "bg-primary/10 border-primary"
                      )}
                      onClick={() => openDialog(day)}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayDeadlines.slice(0, 2).map((deadline) => (
                          <div
                            key={deadline.id}
                            className={cn(
                              "text-xs p-1 rounded text-white truncate",
                              getTypeColor(deadline.deadline_type),
                              deadline.completed && "opacity-50 line-through"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDialog(day, deadline);
                            }}
                          >
                            {deadline.title}
                          </div>
                        ))}
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
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Application</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Scholarship</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Test</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Interview</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span>Reminder</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 