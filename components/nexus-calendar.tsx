"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, X } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

// Types
interface Deadline {
  id: string;
  title: string;
  type: "application" | "scholarship" | "test";
  priority: "high" | "medium" | "low";
  notes: string;
  completed: boolean;
  date: Date;
}

interface CalendarProps {
  deadlines?: Deadline[];
}

const deadlineTypeColors = {
  application: "bg-red-500",
  scholarship: "bg-blue-500",
  test: "bg-green-500",
};

const deadlineTypeLabels = {
  application: "Application",
  scholarship: "Scholarship",
  test: "Test",
};

const priorityIcons = {
  high: <AlertCircle className="h-3 w-3" />,
  medium: <Clock className="h-3 w-3" />,
  low: <CalendarIcon className="h-3 w-3" />,
};

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

export function NexusCalendar({ deadlines = [] }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "application" as Deadline["type"],
    priority: "medium" as Deadline["priority"],
    notes: "",
    completed: false,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(today);
  };

  const openDialog = (date?: Date, deadline?: Deadline) => {
    if (deadline) {
      setEditingDeadline(deadline);
      setFormData({
        title: deadline.title,
        type: deadline.type,
        priority: deadline.priority,
        notes: deadline.notes,
        completed: deadline.completed,
      });
    } else {
      setEditingDeadline(null);
      setFormData({
        title: "",
        type: "application",
        priority: "medium",
        notes: "",
        completed: false,
      });
    }
    setSelectedDate(date || null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingDeadline(null);
    setSelectedDate(null);
  };

  const handleSave = () => {
    // In a real app, this would save to a backend
    console.log("Saving deadline:", {
      ...formData,
      date: selectedDate,
      id: editingDeadline?.id || Date.now().toString(),
    });
    closeDialog();
  };

  const handleDelete = () => {
    // In a real app, this would delete from backend
    console.log("Deleting deadline:", editingDeadline?.id);
    closeDialog();
  };

  const toggleComplete = (deadlineId: string) => {
    // In a real app, this would update the backend
    console.log("Toggling completion for:", deadlineId);
  };

  const getDeadlinesForDate = (date: Date) => {
    return deadlines.filter(deadline => isSameDay(deadline.date, date));
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                NEXUS Education Calendar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button onClick={() => openDialog(today)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Deadline
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Day Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, dayIdx) => {
              const dayDeadlines = getDeadlinesForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "bg-background min-h-[120px] p-2 cursor-pointer hover:bg-accent/50 transition-colors",
                    !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                    dayIdx === 0 && colStartClasses[getDay(day)]
                  )}
                  onClick={() => openDialog(day)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCurrentDay && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Deadlines */}
                  <div className="space-y-1">
                    {dayDeadlines.slice(0, 3).map((deadline) => (
                      <div
                        key={deadline.id}
                        className={cn(
                          "text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity",
                          deadlineTypeColors[deadline.type],
                          "text-white",
                          deadline.completed && "opacity-50 line-through"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDialog(day, deadline);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {priorityIcons[deadline.priority]}
                          <span className="truncate flex-1">{deadline.title}</span>
                          {deadline.completed && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    ))}
                    {dayDeadlines.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayDeadlines.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Application Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Scholarship Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Test Dates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded opacity-50"></div>
              <span>Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDeadline ? "Edit Deadline" : "Add New Deadline"}
            </DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter deadline title"
              />
            </div>

            <div>
              <Label htmlFor="type">Deadline Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Deadline["type"]) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application">Application Deadline</SelectItem>
                  <SelectItem value="scholarship">Scholarship Deadline</SelectItem>
                  <SelectItem value="test">Test Date (GMAT/GRE/TOEFL)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Deadline["priority"]) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or details"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="completed"
                checked={formData.completed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, completed: checked as boolean })
                }
              />
              <Label htmlFor="completed">Mark as completed</Label>
            </div>
          </div>

          <DialogFooter>
            {editingDeadline && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave}>
              {editingDeadline ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sample data for demonstration
const sampleDeadlines: Deadline[] = [
  {
    id: "1",
    title: "Harvard MBA Application",
    type: "application",
    priority: "high",
    notes: "Need to submit essays and recommendations",
    completed: false,
    date: new Date(2024, 11, 15), // December 15, 2024
  },
  {
    id: "2",
    title: "Merit Scholarship Application",
    type: "scholarship",
    priority: "medium",
    notes: "Financial aid application deadline",
    completed: false,
    date: new Date(2024, 11, 20), // December 20, 2024
  },
  {
    id: "3",
    title: "GMAT Test Date",
    type: "test",
    priority: "high",
    notes: "Retake for better score",
    completed: false,
    date: new Date(2024, 11, 10), // December 10, 2024
  },
  {
    id: "4",
    title: "Stanford Application",
    type: "application",
    priority: "high",
    notes: "Complete application package",
    completed: true,
    date: new Date(2024, 10, 30), // November 30, 2024
  },
  {
    id: "5",
    title: "TOEFL Test",
    type: "test",
    priority: "medium",
    notes: "English proficiency test",
    completed: true,
    date: new Date(2024, 10, 15), // November 15, 2024
  },
  {
    id: "6",
    title: "Need-based Aid Application",
    type: "scholarship",
    priority: "low",
    notes: "Submit FAFSA documents",
    completed: false,
    date: new Date(2025, 0, 5), // January 5, 2025
  },
];

export function NexusCalendarWithData() {
  return <NexusCalendar deadlines={sampleDeadlines} />;
} 