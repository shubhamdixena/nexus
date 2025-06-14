"use client";

import { useState, useEffect } from "react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { CalendarDays, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

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

  async getSchoolDeadlines(): Promise<any[]> {
    const response = await fetch('/api/school-deadlines');
    if (!response.ok) {
      throw new Error('Failed to fetch school deadlines');
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
  const [schoolDeadlines, setSchoolDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = async () => {
    try {
      setLoading(true);
      
      // Load personal deadlines (may be empty if not authenticated)
      let personalDeadlines: Deadline[] = [];
      try {
        personalDeadlines = await deadlineAPI.getDeadlines();
      } catch (error) {
        console.warn('Failed to load personal deadlines:', error);
      }
      
      // Load school deadlines (available to everyone)
      let globalSchoolDeadlines: any[] = [];
      try {
        globalSchoolDeadlines = await deadlineAPI.getSchoolDeadlines();
      } catch (error) {
        console.warn('Failed to load school deadlines:', error);
      }
      
      setDeadlines(personalDeadlines);
      setSchoolDeadlines(globalSchoolDeadlines);
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
  
  // Filter personal deadlines
  const personalDeadlinesFiltered = deadlines
    .filter(deadline => !deadline.completed)
    .filter(deadline => {
      const deadlineDate = new Date(deadline.deadline_date);
      return isAfter(deadlineDate, today) || format(deadlineDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    })
    .map(deadline => ({ ...deadline, isSchoolDeadline: false }));

  // Filter school deadlines
  const schoolDeadlinesFiltered = schoolDeadlines
    .filter(deadline => {
      const deadlineDate = new Date(deadline.deadline_date);
      return isAfter(deadlineDate, today) || format(deadlineDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    })
    .map(deadline => ({
      ...deadline,
      completed: false, // School deadlines can't be completed
      isSchoolDeadline: true
    }));

  // Logic: If user has personal deadlines, show only personal deadlines
  // If user has no personal deadlines, show all school deadlines
  const hasPersonalDeadlines = personalDeadlinesFiltered.length > 0;
  const displayDeadlines = hasPersonalDeadlines ? personalDeadlinesFiltered : schoolDeadlinesFiltered;
  
  const importantDates = displayDeadlines
    .sort((a, b) => {
      // Sort by date first
      const dateCompare = new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime();
      return dateCompare;
    })
    .slice(0, 5); // Limit to 5 items



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
          {hasPersonalDeadlines ? "Your Deadlines" : "School Deadlines"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {importantDates.length > 0 ? (
          <div className="space-y-3">
            {importantDates.map((deadline) => {
              const isSchoolDeadline = (deadline as any).isSchoolDeadline;
              const isPersonalDeadline = !isSchoolDeadline;
              
              return (
                <div
                  key={deadline.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors min-h-[80px]",
                    isSchoolDeadline && "border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/30"
                  )}
                >
                  {isPersonalDeadline && (
                    <Checkbox
                      checked={deadline.completed}
                      onCheckedChange={() => handleToggleComplete(deadline)}
                      className="flex-shrink-0 mt-1"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm leading-tight">
                            {isSchoolDeadline && deadline.school_name ? 
                              deadline.school_name : 
                              deadline.title
                            }
                          </div>
                          {isSchoolDeadline && (
                            <div className="text-sm text-muted-foreground mt-1 leading-tight">
                              {deadline.title}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-sm font-medium text-muted-foreground">
                            {format(new Date(deadline.deadline_date), 'MMM dd, yyyy')}
                          </span>
                          <Badge 
                            variant={getDaysUntil(deadline.deadline_date) === "Today" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {getDaysUntil(deadline.deadline_date)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {displayDeadlines.length > 5 && (
              <div className="pt-2">
                <Button variant="ghost" size="sm" className="w-full text-sm">
                  View {displayDeadlines.length - 5} more deadlines
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No upcoming deadlines</p>
            <p className="text-xs mt-1">
              {hasPersonalDeadlines ? 
                "All your personal deadlines are completed or past due." :
                "No school deadlines found. Add personal deadlines to your calendar to see them here."
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 