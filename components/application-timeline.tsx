"use client"

import { useState } from "react"
import { Calendar, Check, Clock, Plus } from "lucide-react"

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

export function ApplicationTimeline() {
  const [showAddEventDialog, setShowAddEventDialog] = useState(false)
  const [filterUniversity, setFilterUniversity] = useState<string | null>(null)

  const filteredEvents = filterUniversity
    ? events.filter((event) => event.university === filterUniversity || event.university === "All Universities")
    : events

  const universities = Array.from(new Set(events.map((event) => event.university)))

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Timeline</h1>
          <p className="text-muted-foreground mt-2">Track your application progress and important deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Timeline Event</DialogTitle>
                <DialogDescription>Add a new event to your application timeline.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input id="event-title" placeholder="Enter event title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input id="event-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-university">University</Label>
                  <Select>
                    <SelectTrigger id="event-university">
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="harvard">Harvard Business School</SelectItem>
                      <SelectItem value="stanford">Stanford GSB</SelectItem>
                      <SelectItem value="wharton">Wharton School</SelectItem>
                      <SelectItem value="all">All Universities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select>
                    <SelectTrigger id="event-type">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deadline">Application Deadline</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="document">Document Submission</SelectItem>
                      <SelectItem value="result">Result Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-description">Description (Optional)</Label>
                  <Input id="event-description" placeholder="Enter description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddEventDialog(false)}>
                  Cancel
                </Button>
                <Button>Add Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Select value={filterUniversity || "all"} onValueChange={(value) => setFilterUniversity(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {universities.map((university) => (
                <SelectItem key={university} value={university}>
                  {university}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="mb-6">
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="checklist">Checklist View</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="relative space-y-8 pl-8 pt-2 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-muted">
                {filteredEvents
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event, index) => (
                    <TimelineEvent key={index} event={event} />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>View your application timeline in a calendar format</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex h-[400px] items-center justify-center rounded-lg border bg-muted/50">
                <div className="text-center">
                  <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Calendar view would be implemented here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Checklist</CardTitle>
              <CardDescription>Track your application requirements</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {universities
                  .filter((uni) => uni !== "All Universities")
                  .map((university) => (
                    <div key={university} className="space-y-3">
                      <h3 className="font-medium">{university}</h3>
                      <div className="space-y-2">
                        {checklistItems
                          .filter((item) => item.university === university)
                          .map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`${university}-${index}`}
                                className="h-4 w-4"
                                checked={item.completed}
                              />
                              <Label htmlFor={`${university}-${index}`} className="text-sm">
                                {item.title}
                              </Label>
                              {item.deadline && (
                                <span className="ml-auto text-xs text-muted-foreground">Due: {item.deadline}</span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TimelineEvent({ event }: { event: TimelineEvent }) {
  const eventDate = new Date(event.date)
  const currentDate = new Date()
  const isPast = eventDate < currentDate
  const isToday = eventDate.toDateString() === currentDate.toDateString()

  return (
    <div className="relative">
      <div
        className={`absolute -left-10 flex h-6 w-6 items-center justify-center rounded-full ${
          isPast
            ? "bg-primary text-primary-foreground"
            : isToday
              ? "bg-yellow-500 text-primary-foreground"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {isPast ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-medium">{event.title}</h3>
          <p className="text-sm text-muted-foreground">
            {event.university} • {new Date(event.date).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={getEventBadgeVariant(event.type)}>{event.type}</Badge>
      </div>
      {event.description && <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>}
    </div>
  )
}

function getEventBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "Deadline":
      return "destructive"
    case "Exam":
      return "secondary"
    case "Interview":
      return "default"
    case "Document":
      return "outline"
    case "Result":
      return "default"
    default:
      return "outline"
  }
}

interface TimelineEvent {
  title: string
  date: string
  university: string
  type: string
  description?: string
}

const events: TimelineEvent[] = [
  {
    title: "GMAT Exam",
    date: "2023-10-15",
    university: "All Universities",
    type: "Exam",
    description: "Completed with a score of 720",
  },
  {
    title: "TOEFL Exam",
    date: "2023-11-05",
    university: "All Universities",
    type: "Exam",
    description: "Completed with a score of 110",
  },
  {
    title: "Harvard Application Deadline",
    date: "2024-01-04",
    university: "Harvard Business School",
    type: "Deadline",
    description: "Round 2 application deadline",
  },
  {
    title: "Stanford Application Deadline",
    date: "2024-01-10",
    university: "Stanford GSB",
    type: "Deadline",
    description: "Round 2 application deadline",
  },
  {
    title: "Wharton Application Deadline",
    date: "2024-01-15",
    university: "Wharton School",
    type: "Deadline",
    description: "Round 2 application deadline",
  },
  {
    title: "Harvard Interview Invitation",
    date: "2024-02-10",
    university: "Harvard Business School",
    type: "Interview",
    description: "Expected date for interview invitations",
  },
  {
    title: "Stanford Interview Invitation",
    date: "2024-02-15",
    university: "Stanford GSB",
    type: "Interview",
    description: "Expected date for interview invitations",
  },
  {
    title: "Wharton Interview Invitation",
    date: "2024-02-20",
    university: "Wharton School",
    type: "Interview",
    description: "Expected date for interview invitations",
  },
  {
    title: "Harvard Decision",
    date: "2024-03-30",
    university: "Harvard Business School",
    type: "Result",
    description: "Final admission decision",
  },
  {
    title: "Stanford Decision",
    date: "2024-04-05",
    university: "Stanford GSB",
    type: "Result",
    description: "Final admission decision",
  },
  {
    title: "Wharton Decision",
    date: "2024-04-10",
    university: "Wharton School",
    type: "Result",
    description: "Final admission decision",
  },
]

interface ChecklistItem {
  title: string
  university: string
  completed: boolean
  deadline?: string
}

const checklistItems: ChecklistItem[] = [
  {
    title: "Submit Online Application",
    university: "Harvard Business School",
    completed: true,
    deadline: "Jan 4, 2024",
  },
  {
    title: "Pay Application Fee",
    university: "Harvard Business School",
    completed: true,
    deadline: "Jan 4, 2024",
  },
  {
    title: "Submit GMAT/GRE Score",
    university: "Harvard Business School",
    completed: true,
    deadline: "Jan 4, 2024",
  },
  {
    title: "Submit TOEFL Score",
    university: "Harvard Business School",
    completed: true,
    deadline: "Jan 4, 2024",
  },
  {
    title: "Submit Transcripts",
    university: "Harvard Business School",
    completed: true,
    deadline: "Jan 4, 2024",
  },
  {
    title: "Submit Letters of Recommendation",
    university: "Harvard Business School",
    completed: false,
    deadline: "Jan 4, 2024",
  },
  {
    title: "Submit Resume",
    university: "Harvard Business School",
    completed: true,
    deadline: "Jan 4, 2024",
  },
  {
    title: "Submit Essays",
    university: "Harvard Business School",
    completed: false,
    deadline: "Jan 4, 2024",
  },
  {
    title: "Submit Online Application",
    university: "Stanford GSB",
    completed: true,
    deadline: "Jan 10, 2024",
  },
  {
    title: "Pay Application Fee",
    university: "Stanford GSB",
    completed: true,
    deadline: "Jan 10, 2024",
  },
  {
    title: "Submit GMAT/GRE Score",
    university: "Stanford GSB",
    completed: true,
    deadline: "Jan 10, 2024",
  },
  {
    title: "Submit TOEFL Score",
    university: "Stanford GSB",
    completed: true,
    deadline: "Jan 10, 2024",
  },
  {
    title: "Submit Transcripts",
    university: "Stanford GSB",
    completed: false,
    deadline: "Jan 10, 2024",
  },
  {
    title: "Submit Letters of Recommendation",
    university: "Stanford GSB",
    completed: false,
    deadline: "Jan 10, 2024",
  },
  {
    title: "Submit Resume",
    university: "Stanford GSB",
    completed: true,
    deadline: "Jan 10, 2024",
  },
  {
    title: "Submit Essays",
    university: "Stanford GSB",
    completed: false,
    deadline: "Jan 10, 2024",
  },
  {
    title: "Submit Online Application",
    university: "Wharton School",
    completed: false,
    deadline: "Jan 15, 2024",
  },
  {
    title: "Pay Application Fee",
    university: "Wharton School",
    completed: false,
    deadline: "Jan 15, 2024",
  },
  {
    title: "Submit GMAT/GRE Score",
    university: "Wharton School",
    completed: true,
    deadline: "Jan 15, 2024",
  },
  {
    title: "Submit TOEFL Score",
    university: "Wharton School",
    completed: true,
    deadline: "Jan 15, 2024",
  },
  {
    title: "Submit Transcripts",
    university: "Wharton School",
    completed: false,
    deadline: "Jan 15, 2024",
  },
  {
    title: "Submit Letters of Recommendation",
    university: "Wharton School",
    completed: false,
    deadline: "Jan 15, 2024",
  },
  {
    title: "Submit Resume",
    university: "Wharton School",
    completed: false,
    deadline: "Jan 15, 2024",
  },
  {
    title: "Submit Essays",
    university: "Wharton School",
    completed: false,
    deadline: "Jan 15, 2024",
  },
]
