"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MoreHorizontal,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  FileText,
  Calendar,
  User,
  School,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Import Supabase realtime services
import {
  ApplicationRealtimeService,
  type ExtendedApplication
} from '@/lib/realtime-services'

// Define Application type locally to match the component's usage
type Application = {
  id: string
  status: 'submitted' | 'under_review' | 'interview_scheduled' | 'accepted' | 'rejected' | 'waitlisted'
  user_id: string
  created_at: string
  updated_at?: string
}

import { useToast } from "@/hooks/use-toast"

export const AdminApplicationManagement = React.memo(() => {
  const [applications, setApplications] = useState<ExtendedApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [programFilter, setProgramFilter] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<ExtendedApplication | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [newCommunication, setNewCommunication] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Load applications from Supabase
  const loadApplications = async (page = 1, search = "", status = "", program = "") => {
    try {
      setLoading(true)
      const filters: any = {}
      if (status && status !== "all") filters.status = status
      if (program && program !== "all") filters.program = program

      const response = await ApplicationRealtimeService.getApplications({
        page,
        limit: 10,
        search,
        filters,
        sortBy: "submitted_date",
        sortOrder: "desc",
      })

      setApplications(response.data)
      setTotalPages(response.pagination.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error loading applications:", error)
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadApplications()
  }, [])

  // Handle search and filters with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      loadApplications(1, searchTerm, statusFilter || "", programFilter || "")
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter, programFilter])

  // Handle updating application status
  const handleUpdateStatus = async (applicationId: string, newStatus: Application['status']) => {
    try {
      setIsSubmitting(true)
      await ApplicationRealtimeService.updateApplicationStatus(applicationId, newStatus)

      // Reload data to reflect changes
      await loadApplications(currentPage, searchTerm, statusFilter || "", programFilter || "")

      // Update selected application if it's the one being updated
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus })
      }

      toast({
        title: "Status Updated",
        description: `Application status has been updated to ${newStatus.replace('_', ' ')}.`,
      })
    } catch (error) {
      console.error("Error updating application status:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle adding a new communication
  const handleAddCommunication = () => {
    if (!selectedApplication || !newCommunication.trim()) return

    const newComm = {
      id: `comm-${Date.now()}`,
      type: "email" as const,
      content: newCommunication,
      timestamp: new Date().toISOString(),
      direction: "outbound" as const
    }

    // In a real implementation, you would save this to the database
    // For now, we'll just add it to the local state
    const updatedApplication = {
      ...selectedApplication,
      communications: [...(selectedApplication.communications || []), newComm],
    }

    setSelectedApplication(updatedApplication)
    setNewCommunication("")

    toast({
      title: "Communication Added",
      description: "Your message has been added to the application.",
    })
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      case "under_review":
        return "secondary"
      case "interview_scheduled":
        return "outline"
      case "waitlisted":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "under_review":
        return <Clock className="h-4 w-4" />
      case "interview_scheduled":
        return <Calendar className="h-4 w-4" />
      case "waitlisted":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Application Management</CardTitle>
          <CardDescription>Review and manage student applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={programFilter || "all"} onValueChange={(value) => setProgramFilter(value === "all" ? null : value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="MBA">MBA</SelectItem>
                  <SelectItem value="Executive MBA">Executive MBA</SelectItem>
                  <SelectItem value="Full-time MBA">Full-time MBA</SelectItem>
                  <SelectItem value="Part-time MBA">Part-time MBA</SelectItem>
                  <SelectItem value="Masters">Masters</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading applications...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : applications.length > 0 ? (
                  applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.student_name}</div>
                          <div className="text-sm text-muted-foreground">{application.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{application.school}</TableCell>
                      <TableCell>{application.program}</TableCell>
                      <TableCell>{format(new Date(application.submitted_date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(application.status)} className="flex items-center gap-1">
                          {getStatusIcon(application.status)}
                          {application.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedApplication(application)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(application.id, "under_review")}
                              disabled={isSubmitting}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Mark Under Review
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(application.id, "accepted")}
                              disabled={isSubmitting}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Accept
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(application.id, "rejected")}
                              disabled={isSubmitting}
                              className="text-red-600 dark:text-red-400"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadApplications(currentPage - 1, searchTerm, statusFilter || "", programFilter || "")}
                  disabled={currentPage <= 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadApplications(currentPage + 1, searchTerm, statusFilter || "", programFilter || "")}
                  disabled={currentPage >= totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review complete application information and communicate with the student.</DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
                <TabsTrigger value="details">Personal Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Student Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedApplication.student_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.email}</span>
                      </div>
                      {selectedApplication.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedApplication.phone}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <School className="h-5 w-5" />
                        Application Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedApplication.school}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.program}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Submitted: {format(new Date(selectedApplication.submitted_date), "PPP")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedApplication.status)}
                        <Badge variant={getStatusBadgeVariant(selectedApplication.status)}>
                          {selectedApplication.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Update Application Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedApplication.id, "under_review")}
                        disabled={isSubmitting || selectedApplication.status === "under_review"}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Under Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedApplication.id, "interview_scheduled")}
                        disabled={isSubmitting || selectedApplication.status === "interview_scheduled"}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Interview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedApplication.id, "accepted")}
                        disabled={isSubmitting || selectedApplication.status === "accepted"}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedApplication.id, "waitlisted")}
                        disabled={isSubmitting || selectedApplication.status === "waitlisted"}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Waitlist
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedApplication.id, "rejected")}
                        disabled={isSubmitting || selectedApplication.status === "rejected"}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Submitted Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedApplication.documents.map((doc: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-blue-500" />
                              <div>
                                <div className="font-medium">{doc.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Uploaded: {format(new Date(doc.uploadedAt), "MMM dd, yyyy")}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No documents uploaded yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Communication History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedApplication.communications && selectedApplication.communications.length > 0 ? (
                      <div className="space-y-4">
                        {selectedApplication.communications.map((comm: any) => (
                          <div key={comm.id} className="border-l-2 border-blue-200 pl-4 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium capitalize">{comm.sender}</span>
                                <Badge variant="outline" className="text-xs">
                                  {comm.type}
                                </Badge>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(comm.date), "MMM dd, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm">{comm.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No communications yet.
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Label htmlFor="new-communication">Add New Communication</Label>
                      <Textarea
                        id="new-communication"
                        placeholder="Type your message here..."
                        value={newCommunication}
                        onChange={(e) => setNewCommunication(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddCommunication} disabled={!newCommunication.trim()}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedApplication.details ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Address</Label>
                          <p className="text-sm">{selectedApplication.details.address}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Date of Birth</Label>
                          <p className="text-sm">{format(new Date(selectedApplication.details.dateOfBirth), "PPP")}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Nationality</Label>
                          <p className="text-sm">{selectedApplication.details.nationality}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No additional details available.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedApplication.details?.education && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Education History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedApplication.details.education.map((edu: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium">{edu.institution}</h4>
                            <p className="text-sm text-muted-foreground">{edu.degree}</p>
                            <p className="text-sm">Graduated: {edu.graduationYear} | GPA: {edu.gpa}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedApplication.details?.workExperience && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Work Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedApplication.details.workExperience.map((work: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium">{work.position}</h4>
                            <p className="text-sm text-muted-foreground">{work.company}</p>
                            <p className="text-sm">{work.startDate} - {work.endDate}</p>
                            <p className="text-sm mt-2">{work.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedApplication.details?.testScores && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Test Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedApplication.details.testScores.gmat && (
                          <div>
                            <Label className="text-sm font-medium">GMAT</Label>
                            <p className="text-sm">{selectedApplication.details.testScores.gmat}</p>
                          </div>
                        )}
                        {selectedApplication.details.testScores.gre && (
                          <div>
                            <Label className="text-sm font-medium">GRE</Label>
                            <p className="text-sm">{selectedApplication.details.testScores.gre}</p>
                          </div>
                        )}
                        {selectedApplication.details.testScores.toefl && (
                          <div>
                            <Label className="text-sm font-medium">TOEFL</Label>
                            <p className="text-sm">{selectedApplication.details.testScores.toefl}</p>
                          </div>
                        )}
                        {selectedApplication.details.testScores.ielts && (
                          <div>
                            <Label className="text-sm font-medium">IELTS</Label>
                            <p className="text-sm">{selectedApplication.details.testScores.ielts}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})

AdminApplicationManagement.displayName = "AdminApplicationManagement"
