"use client";

import { useState } from "react";
import { format, isBefore, isToday, isAfter, addDays } from "date-fns";
import { CalendarDays, Clock, AlertCircle, CheckCircle2, ChevronRight, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Types
interface ImportantDate {
  id: string;
  title: string;
  date: Date;
  type: "application" | "scholarship" | "test" | "reminder";
  priority: "high" | "medium" | "low";
  description?: string;
  completed: boolean;
}

const sampleImportantDates: ImportantDate[] = [
  {
    id: "1",
    title: "Harvard MBA Application Due",
    type: "application",
    priority: "high",
    date: new Date(2024, 11, 15), // December 15, 2024
    description: "Submit complete application package",
    completed: false,
  },
  {
    id: "2",
    title: "GMAT Retake",
    type: "test",
    priority: "high",
    date: new Date(2024, 11, 10), // December 10, 2024
    description: "Test center: Downtown location",
    completed: false,
  },
  {
    id: "3",
    title: "Stanford Application Due",
    type: "application",
    priority: "high",
    date: new Date(2024, 10, 30), // November 30, 2024
    description: "All essays and recommendations",
    completed: true,
  },
  {
    id: "4",
    title: "Scholarship Essay Due",
    type: "scholarship",
    priority: "medium",
    date: new Date(2024, 11, 20), // December 20, 2024
    description: "Merit-based scholarship application",
    completed: false,
  },
  {
    id: "5",
    title: "Interview Preparation",
    type: "reminder",
    priority: "medium",
    date: new Date(2025, 0, 5), // January 5, 2025
    description: "Mock interview session",
    completed: false,
  },
  {
    id: "6",
    title: "TOEFL Results",
    type: "test",
    priority: "low",
    date: new Date(2025, 0, 15), // January 15, 2025
    description: "Expected result date",
    completed: false,
  },
];

const typeColors = {
  application: "bg-red-500",
  scholarship: "bg-blue-500",
  test: "bg-green-500",
  reminder: "bg-yellow-500",
};

const typeLabels = {
  application: "Application",
  scholarship: "Scholarship",
  test: "Test",
  reminder: "Reminder",
};

const priorityIcons = {
  high: <AlertCircle className="h-3 w-3" />,
  medium: <Clock className="h-3 w-3" />,
  low: <CalendarDays className="h-3 w-3" />,
};

export function ImportantDatesList() {
  const [dates] = useState<ImportantDate[]>(sampleImportantDates);

  // Sort dates by date and priority
  const sortedDates = [...dates].sort((a, b) => {
    // First sort by date
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    
    // Then by priority (high first)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Separate upcoming and overdue dates
  const today = new Date();
  const upcomingDates = sortedDates.filter(date => 
    (isAfter(date.date, today) || isToday(date.date)) && !date.completed
  );
  const overdueDates = sortedDates.filter(date => 
    isBefore(date.date, today) && !date.completed
  );
  const completedDates = sortedDates.filter(date => date.completed);

  const getDateStatus = (date: Date) => {
    if (isToday(date)) return "today";
    if (isBefore(date, today)) return "overdue";
    if (isBefore(date, addDays(today, 7))) return "this-week";
    if (isBefore(date, addDays(today, 30))) return "this-month";
    return "future";
  };

  const getDateStatusColor = (status: string) => {
    switch (status) {
      case "today": return "text-red-600 dark:text-red-400";
      case "overdue": return "text-red-500 dark:text-red-400";
      case "this-week": return "text-orange-600 dark:text-orange-400";
      case "this-month": return "text-blue-600 dark:text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  const DateItem = ({ date: dateItem }: { date: ImportantDate }) => {
    const status = getDateStatus(dateItem.date);
    const statusColor = getDateStatusColor(status);

    return (
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-accent/50",
          dateItem.completed && "opacity-60"
        )}
      >
        <div className="flex-shrink-0 mt-1">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              typeColors[dateItem.type],
              dateItem.completed && "opacity-50"
            )}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn(
              "text-sm font-medium truncate",
              dateItem.completed && "line-through"
            )}>
              {dateItem.title}
            </h4>
            {dateItem.completed && (
              <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-medium", statusColor)}>
              {format(dateItem.date, "MMM d, yyyy")}
            </span>
            <Badge variant="outline" className="text-xs px-1 py-0">
              {typeLabels[dateItem.type]}
            </Badge>
          </div>
          
          {dateItem.description && (
            <p className="text-xs text-muted-foreground truncate">
              {dateItem.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {priorityIcons[dateItem.priority]}
              <span className="text-xs text-muted-foreground capitalize">
                {dateItem.priority}
              </span>
            </div>
            {status === "today" && (
              <Badge variant="destructive" className="text-xs">
                Due Today
              </Badge>
            )}
            {status === "overdue" && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
            {status === "this-week" && (
              <Badge variant="secondary" className="text-xs">
                This Week
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Important Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedDates.length > 0 ? (
          <>
            {sortedDates.slice(0, 8).map((date) => (
              <DateItem key={date.id} date={date} />
            ))}
            {sortedDates.length > 8 && (
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View {sortedDates.length - 8} more dates
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No important dates</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 