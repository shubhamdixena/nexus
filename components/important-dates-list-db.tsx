"use client";

import { useState, useEffect } from "react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { CalendarDays, Clock, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast"
import { ReportDataButton } from "@/components/report-data-button";

// Types
interface Deadline {
  id: string;
  title: string;
  deadline_type: "application" | "scholarship" | "test" | "reminder" | "interview";
  priority: "high" | "medium" | "low";
  deadline_date: string;
  notes?: string;
  completed: boolean;
  completed_at?: string;
  source_type?: "manual" | "school_bookmark" | "scholarship_save" | "auto_test";
  source_id?: string;
  created_at: string;
  updated_at: string;
}

// API functions
const deadlineAPI = {
  async getDeadlines(): Promise<Deadline[]> {
    const response = await fetch('/api/deadlines');
    if (!response.ok) {
      throw new Error('Failed to fetch deadlines');
    }
    const data = await response.json();
    return data.deadlines;
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
  }
};

export function ImportantDatesListDB() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = async () => {
    try {
      setLoading(true);
      const data = await deadlineAPI.getDeadlines();
      setDeadlines(data);
    } catch (error) {
      console.error('Error loading deadlines:', error);
      toast({
        title: "Error",
        description: "Failed to load important dates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (deadline: Deadline) => {
    try {
      await deadlineAPI.updateDeadline(deadline.id, {
        completed: !deadline.completed
      });
      await loadDeadlines(); // Reload to get updated data
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

  // Filter and sort deadlines
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const importantDates = deadlines
    .filter(deadline => !deadline.completed)
    .filter(deadline => {
      const deadlineDate = new Date(deadline.deadline_date);
      return isAfter(deadlineDate, today) || format(deadlineDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    })
    .sort((a, b) => {
      // Sort by date first, then by priority
      const dateCompare = new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime();
      if (dateCompare !== 0) return dateCompare;
      
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 8); // Limit to 8 items

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "application": return "📝";
      case "scholarship": return "💰";
      case "test": return "📊";
      case "interview": return "🎤";
      default: return "📅";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 dark:text-red-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "low": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-gray-400";
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

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return "Overdue";
    return `${diffDays} days`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Important Dates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {importantDates.length > 0 ? (
          <div className="space-y-3">
            {importantDates.map((deadline) => (
              <div
                key={deadline.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Checkbox
                    checked={deadline.completed}
                    onCheckedChange={() => handleToggleComplete(deadline)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getTypeIcon(deadline.deadline_type)}</span>
                      <span className="font-medium text-sm truncate">{deadline.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(deadline.deadline_date), 'MMM dd, yyyy')}</span>
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", getPriorityBadge(deadline.priority))}
                      >
                        {deadline.priority}
                      </Badge>
                    </div>
                    <div className={cn("text-xs font-medium mt-1", getPriorityColor(deadline.priority))}>
                      {getDaysUntil(deadline.deadline_date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {deadlines.filter(d => !d.completed).length > 8 && (
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View {deadlines.filter(d => !d.completed).length - 8} more deadlines
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming deadlines</p>
            <p className="text-xs mt-1">Add deadlines to your calendar to see them here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 