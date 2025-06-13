"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Flag,
  Check,
  X,
  Clock,
  ExternalLink,
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  AlertCircle,
  User,
  Calendar,
  FileText,
  Edit,
  Save,
  XCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabaseClient"
import type { DataCorrectionReport, DataCorrectionAnalytics, DataCorrectionHistory } from "@/types"

export function AdminDataCorrections() {
  const [reports, setReports] = useState<DataCorrectionReport[]>([])
  const [analytics, setAnalytics] = useState<DataCorrectionAnalytics[]>([])
  const [selectedReport, setSelectedReport] = useState<DataCorrectionReport | null>(null)
  const [reportHistory, setReportHistory] = useState<DataCorrectionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentData, setCurrentData] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [isEditingSuggestedValue, setIsEditingSuggestedValue] = useState(false)
  const [editedSuggestedValue, setEditedSuggestedValue] = useState('')
  
  const { toast } = useToast()
  const supabase = createClient()

  // Admin notes form
  const [adminAction, setAdminAction] = useState({
    status: '',
    notes: '',
    implementation_notes: ''
  })

  useEffect(() => {
    loadReports()
    loadAnalytics()
  }, [])

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('data_correction_reports')
        .select(`*`)
        .order('created_at', { ascending: false })

      if (error) {
        // Check if the table doesn't exist yet
        if (error.message?.includes('relation "public.data_correction_reports" does not exist')) {
          console.log('Data correction tables not created yet. Please run migration: supabase migration up')
          setReports([])
          return
        }
        throw error
      }

      const transformedReports: DataCorrectionReport[] = data?.map(report => ({
        ...report,
        reporter_name: 'User ' + report.reporter_id.slice(-8),
        reviewer_name: report.reviewed_by ? 'Admin ' + report.reviewed_by.slice(-8) : undefined
      })) || []

      setReports(transformedReports)
    } catch (error) {
      console.error('Error loading reports:', error)
      toast({
        title: "Error",
        description: "Failed to load correction reports. Please ensure the database migration has been applied.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('data_correction_analytics')
        .select('*')
        .order('report_count', { ascending: false })

      if (error) {
        // Check if the table doesn't exist yet
        if (error.message?.includes('relation "public.data_correction_analytics" does not exist')) {
          console.log('Analytics table not created yet. Please run migration: supabase migration up')
          setAnalytics([])
          return
        }
        throw error
      }
      setAnalytics(data || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const loadReportHistory = async (reportId: string) => {
    try {
      const { data, error } = await supabase
        .from('data_correction_history')
        .select(`
          *,
          performer:performed_by(email, first_name, last_name)
        `)
        .eq('correction_id', reportId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedHistory: DataCorrectionHistory[] = data?.map(entry => ({
        ...entry,
        performer_name: entry.performer 
          ? `${entry.performer.first_name || ''} ${entry.performer.last_name || ''}`.trim() || entry.performer.email
          : 'System'
      })) || []

      setReportHistory(transformedHistory)
    } catch (error) {
      console.error('Error loading report history:', error)
    }
  }

  const handleUpdateStatus = async (reportId: string, status: string, notes?: string, implementationNotes?: string) => {
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const updateData: any = {
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      }

      if (notes) updateData.admin_notes = notes
      if (implementationNotes) updateData.implementation_notes = implementationNotes

      const { error } = await supabase
        .from('data_correction_reports')
        .update(updateData)
        .eq('id', reportId)

      if (error) throw error

      toast({
        title: "Status Updated",
        description: `Report status changed to ${status}.`,
        variant: "default"
      })

      loadReports()
      if (selectedReport?.id === reportId) {
        loadReportHistory(reportId)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update report status.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = searchQuery === '' || 
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reporter_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.field_name?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter
      const matchesType = typeFilter === 'all' || report.data_type === typeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesType
    })
  }, [reports, searchQuery, statusFilter, priorityFilter, typeFilter])

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      implemented: 'bg-purple-100 text-purple-800',
      duplicate: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const openReportDetail = (report: DataCorrectionReport) => {
    setSelectedReport(report)
    loadReportHistory(report.id)
    setAdminAction({
      status: report.status,
      notes: report.admin_notes || '',
      implementation_notes: report.implementation_notes || ''
    })
    setIsEditingSuggestedValue(false)
    setEditedSuggestedValue(report.suggested_value || '')
    setIsDetailDialogOpen(true)
  }

  // Function to format suggested value based on data type
  const formatSuggestedValue = (value: string, fieldName?: string): string => {
    if (!value.trim()) return value
    
    // Format URLs
    if (fieldName?.toLowerCase().includes('url') || fieldName?.toLowerCase().includes('website')) {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return `https://${value}`
      }
    }
    
    // Format numeric values
    if (fieldName?.toLowerCase().includes('tuition') || 
        fieldName?.toLowerCase().includes('fee') || 
        fieldName?.toLowerCase().includes('cost') ||
        fieldName?.toLowerCase().includes('salary')) {
      const numValue = parseFloat(value.replace(/[,$]/g, ''))
      if (!isNaN(numValue)) {
        return numValue.toLocaleString()
      }
    }
    
    return value
  }

  // Function to validate suggested value based on data type
  const validateSuggestedValue = (value: string, fieldName?: string): { isValid: boolean; message?: string } => {
    if (!value.trim()) return { isValid: true } // Empty values are allowed
    
    // URL validation
    if (fieldName?.toLowerCase().includes('url') || fieldName?.toLowerCase().includes('website') || fieldName?.toLowerCase().includes('link')) {
      try {
        new URL(value)
        return { isValid: true }
      } catch {
        return { isValid: false, message: 'Please enter a valid URL (e.g., https://example.com)' }
      }
    }
    
    // Email validation
    if (fieldName?.toLowerCase().includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return { isValid: false, message: 'Please enter a valid email address' }
      }
    }
    
    // Number validation for numeric fields
    if (fieldName?.toLowerCase().includes('tuition') || 
        fieldName?.toLowerCase().includes('fee') || 
        fieldName?.toLowerCase().includes('cost') ||
        fieldName?.toLowerCase().includes('salary') ||
        fieldName?.toLowerCase().includes('score') ||
        fieldName?.toLowerCase().includes('gmat') ||
        fieldName?.toLowerCase().includes('gre') ||
        fieldName?.toLowerCase().includes('ranking')) {
      const numValue = parseFloat(value.replace(/[,$]/g, ''))
      if (isNaN(numValue)) {
        return { isValid: false, message: 'Please enter a valid number' }
      }
    }
    
    // Date validation for date fields
    if (fieldName?.toLowerCase().includes('date') || fieldName?.toLowerCase().includes('deadline')) {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return { isValid: false, message: 'Please enter a valid date (YYYY-MM-DD format)' }
      }
    }
    
    return { isValid: true }
  }

  const handleAdminActionSubmit = async () => {
    if (!selectedReport) return

    let shouldUpdate = false
    let updateData: any = {}

    // Check if status changed
    if (adminAction.status !== selectedReport.status) {
      shouldUpdate = true
      updateData.status = adminAction.status
      updateData.admin_notes = adminAction.notes
      updateData.implementation_notes = adminAction.implementation_notes
    }

    // Check if suggested value was edited
    if (editedSuggestedValue !== selectedReport.suggested_value) {
      // Validate the new suggested value
      const validation = validateSuggestedValue(editedSuggestedValue, selectedReport.field_name || undefined)
      if (!validation.isValid) {
        toast({
          title: "Invalid Suggested Value",
          description: validation.message,
          variant: "destructive"
        })
        return
      }
      shouldUpdate = true
      updateData.suggested_value = editedSuggestedValue
    }

    if (shouldUpdate) {
      setSubmitting(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const finalUpdateData = {
          ...updateData,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from('data_correction_reports')
          .update(finalUpdateData)
          .eq('id', selectedReport.id)

        if (error) throw error

        toast({
          title: "Report Updated",
          description: "Report has been updated successfully.",
          variant: "default"
        })

        loadReports()
        if (selectedReport?.id) {
          loadReportHistory(selectedReport.id)
        }
      } catch (error) {
        console.error('Error updating report:', error)
        toast({
          title: "Update Failed",
          description: "Failed to update report.",
          variant: "destructive"
        })
      } finally {
        setSubmitting(false)
      }
    }
    setIsDetailDialogOpen(false)
  }

  // New function to load the actual data for editing
  const loadDataForEditing = async (report: DataCorrectionReport) => {
    if (!report.data_id || !report.data_table) {
      toast({
        title: "Cannot Edit",
        description: "This report doesn't have specific data to edit.",
        variant: "destructive"
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from(report.data_table)
        .select('*')
        .eq('id', report.data_id)
        .single()

      if (error) throw error

      setCurrentData(data)
      setEditFormData({ ...data })
      setSelectedReport(report)
      setIsEditDialogOpen(true)
    } catch (error) {
      console.error('Error loading data for editing:', error)
      toast({
        title: "Load Failed",
        description: "Failed to load data for editing.",
        variant: "destructive"
      })
    }
  }

  // New function to save the edited data
  const handleSaveEditedData = async () => {
    if (!selectedReport || !currentData || !editFormData) return

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update the original data
      const { error: updateError } = await supabase
        .from(selectedReport.data_table!)
        .update({
          ...editFormData,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedReport.data_id)

      if (updateError) throw updateError

      // Update the correction report status to "implemented"
      const { error: statusError } = await supabase
        .from('data_correction_reports')
        .update({
          status: 'implemented',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          implementation_notes: `Applied suggested changes to ${selectedReport.field_name || 'data'}`
        })
        .eq('id', selectedReport.id)

      if (statusError) throw statusError

      toast({
        title: "Changes Applied",
        description: "Data has been updated and report marked as implemented.",
        variant: "default"
      })

      setIsEditDialogOpen(false)
      loadReports()
    } catch (error) {
      console.error('Error saving edited data:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save changes.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading data correction reports...</span>
      </div>
    )
  }

  // Show setup message if tables don't exist
  if (reports.length === 0 && analytics.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Data Correction Management
            </CardTitle>
            <CardDescription>
              Review and manage user-reported data issues and suggested corrections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Setup Required</h3>
              <p className="text-muted-foreground mb-4">
                The data correction system needs to be initialized. Please run the database migration:
              </p>
              <div className="bg-muted p-4 rounded-lg text-left max-w-md mx-auto">
                <code className="text-sm">npx supabase migration up</code>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This will create the necessary tables for the data correction system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Data Correction Management
          </CardTitle>
          <CardDescription>
            Review and manage user-reported data issues and suggested corrections.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Correction Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'approved').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Implemented</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'implemented').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" onClick={loadReports}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                        <SelectItem value="duplicate">Duplicate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="mba_school">MBA School</SelectItem>
                        <SelectItem value="scholarship">Scholarship</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="test_info">Test Info</SelectItem>
                        <SelectItem value="sop">SOP</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reports Table */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.reporter_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.data_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.issue_type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {report.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadge(report.priority)}>
                          {report.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(report.status)}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openReportDetail(report)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => loadDataForEditing(report)}
                              disabled={submitting}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Approve & Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(report.id, 'approved')}
                              disabled={submitting}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve Only
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(report.id, 'rejected')}
                              disabled={submitting}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Most Reported Issues
              </CardTitle>
              <CardDescription>
                Data fields that are frequently reported for corrections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Type</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Report Count</TableHead>
                    <TableHead>Last Reported</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline">{item.data_type}</Badge>
                      </TableCell>
                      <TableCell>{item.field_name || 'General'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.issue_type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{item.report_count}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.last_reported), 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Correction Report Details</DialogTitle>
            <DialogDescription>
              Review and manage this data correction report.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="grid gap-6 py-4">
              {/* Report Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Reporter</Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.reporter_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedReport.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data Type</Label>
                  <Badge variant="outline">{selectedReport.data_type}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Issue Type</Label>
                  <Badge variant="secondary">{selectedReport.issue_type.replace('_', ' ')}</Badge>
                </div>
              </div>

              {/* Issue Details */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm bg-muted p-3 rounded">{selectedReport.description}</p>
                </div>

                {selectedReport.field_name && (
                  <div>
                    <Label className="text-sm font-medium">Field Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedReport.field_name}</p>
                  </div>
                )}

                {(selectedReport.current_value || selectedReport.suggested_value) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Current Value</Label>
                      <p className="text-sm bg-red-50 p-3 rounded">{selectedReport.current_value || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Suggested Value
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingSuggestedValue(!isEditingSuggestedValue)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </Label>
                      {isEditingSuggestedValue ? (
                        <div className="space-y-2">
                                                     {/* Use textarea for longer content or descriptions */}
                           {(selectedReport.field_name?.toLowerCase().includes('description') ||
                             selectedReport.field_name?.toLowerCase().includes('notes') ||
                             selectedReport.field_name?.toLowerCase().includes('requirements') ||
                             editedSuggestedValue.length > 100) ? (
                             <Textarea
                               value={editedSuggestedValue}
                               onChange={(e) => setEditedSuggestedValue(e.target.value)}
                               placeholder="Enter suggested value..."
                               className="text-sm min-h-[100px]"
                               rows={4}
                             />
                           ) : (
                             <Input
                               value={editedSuggestedValue}
                               onChange={(e) => setEditedSuggestedValue(e.target.value)}
                               placeholder={
                                 selectedReport.field_name?.toLowerCase().includes('url') || 
                                 selectedReport.field_name?.toLowerCase().includes('website') ? 
                                 "https://example.com" :
                                 selectedReport.field_name?.toLowerCase().includes('email') ? 
                                 "user@example.com" :
                                 selectedReport.field_name?.toLowerCase().includes('date') || 
                                 selectedReport.field_name?.toLowerCase().includes('deadline') ? 
                                 "YYYY-MM-DD" :
                                 selectedReport.field_name?.toLowerCase().includes('tuition') || 
                                 selectedReport.field_name?.toLowerCase().includes('fee') ? 
                                 "50000" :
                                 "Enter suggested value..."
                               }
                               className="text-sm"
                             />
                           )}
                           {/* Show field type hint */}
                           <p className="text-xs text-muted-foreground">
                             {selectedReport.field_name?.toLowerCase().includes('url') || 
                              selectedReport.field_name?.toLowerCase().includes('website') ? 
                              "🔗 URL format expected" :
                              selectedReport.field_name?.toLowerCase().includes('email') ? 
                              "📧 Email format expected" :
                              selectedReport.field_name?.toLowerCase().includes('date') || 
                              selectedReport.field_name?.toLowerCase().includes('deadline') ? 
                              "📅 Date format (YYYY-MM-DD) expected" :
                              selectedReport.field_name?.toLowerCase().includes('tuition') || 
                              selectedReport.field_name?.toLowerCase().includes('fee') ||
                              selectedReport.field_name?.toLowerCase().includes('salary') ||
                              selectedReport.field_name?.toLowerCase().includes('score') ? 
                              "🔢 Numeric value expected" :
                              "✏️ Text value"
                             }
                           </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditedSuggestedValue(selectedReport.suggested_value || '')
                                setIsEditingSuggestedValue(false)
                              }}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                                                         <Button
                               variant="default"
                               size="sm"
                               onClick={() => {
                                 const validation = validateSuggestedValue(editedSuggestedValue, selectedReport.field_name || undefined)
                                 if (validation.isValid) {
                                   // Format the value before applying
                                   const formattedValue = formatSuggestedValue(editedSuggestedValue, selectedReport.field_name || undefined)
                                   setEditedSuggestedValue(formattedValue)
                                   setIsEditingSuggestedValue(false)
                                   toast({
                                     title: "Suggested Value Updated",
                                     description: "Click 'Update Report' to save changes.",
                                     variant: "default"
                                   })
                                 } else {
                                   toast({
                                     title: "Invalid Value",
                                     description: validation.message,
                                     variant: "destructive"
                                   })
                                 }
                               }}
                             >
                              <Save className="h-3 w-3 mr-1" />
                              Apply
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm bg-green-50 p-3 rounded flex items-center justify-between">
                          <span>{editedSuggestedValue || 'Not specified'}</span>
                          {editedSuggestedValue !== selectedReport.suggested_value && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              Modified
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedReport.evidence_urls && selectedReport.evidence_urls.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Evidence URLs</Label>
                    <div className="space-y-2">
                      {selectedReport.evidence_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.additional_notes && (
                  <div>
                    <Label className="text-sm font-medium">Additional Notes</Label>
                    <p className="text-sm bg-muted p-3 rounded">{selectedReport.additional_notes}</p>
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              <div className="border-t pt-4 space-y-4">
                <Label className="text-lg font-medium">Admin Actions</Label>
                
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="admin-status">Status</Label>
                    <Select value={adminAction.status} onValueChange={(value) => setAdminAction(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                        <SelectItem value="duplicate">Duplicate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="admin-notes">Admin Notes</Label>
                    <Textarea
                      id="admin-notes"
                      value={adminAction.notes}
                      onChange={(e) => setAdminAction(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add notes about your decision or feedback for the reporter..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="implementation-notes">Implementation Notes</Label>
                    <Textarea
                      id="implementation-notes"
                      value={adminAction.implementation_notes}
                      onChange={(e) => setAdminAction(prev => ({ ...prev, implementation_notes: e.target.value }))}
                      placeholder="Notes about how this correction was implemented..."
                    />
                  </div>
                </div>
              </div>

              {/* History */}
              {reportHistory.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="text-lg font-medium">History</Label>
                  <div className="mt-2 space-y-2">
                    {reportHistory.map((entry) => (
                      <div key={entry.id} className="text-sm bg-muted p-3 rounded">
                        <div className="flex justify-between items-start">
                          <span>
                            <strong>{entry.performer_name}</strong> changed status to <Badge className={getStatusBadge(entry.new_status || '')}>{entry.new_status?.replace('_', ' ')}</Badge>
                          </span>
                          <span className="text-muted-foreground">
                            {format(new Date(entry.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="mt-1 text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedReport?.data_table && selectedReport?.data_id && (
              <Button 
                variant="outline" 
                onClick={() => loadDataForEditing(selectedReport)}
                disabled={submitting}
              >
                <Edit className="h-4 w-4 mr-2" />
                Approve & Edit Data
              </Button>
            )}
            <Button onClick={handleAdminActionSubmit} disabled={submitting}>
              {submitting ? "Updating..." : "Update Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data</DialogTitle>
            <DialogDescription>
              Edit the data for this correction report.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="grid gap-6 py-4">
              {/* Report Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Reporter</Label>
                  <p className="text-sm text-muted-foreground">{selectedReport.reporter_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedReport.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data Type</Label>
                  <Badge variant="outline">{selectedReport.data_type}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Issue Type</Label>
                  <Badge variant="secondary">{selectedReport.issue_type.replace('_', ' ')}</Badge>
                </div>
              </div>

              {/* Issue Details */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm bg-muted p-3 rounded">{selectedReport.description}</p>
                </div>

                {selectedReport.field_name && (
                  <div>
                    <Label className="text-sm font-medium">Field Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedReport.field_name}</p>
                  </div>
                )}

                {(selectedReport.current_value || selectedReport.suggested_value) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Current Value</Label>
                      <p className="text-sm bg-red-50 p-3 rounded">{selectedReport.current_value || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Suggested Value</Label>
                      <p className="text-sm bg-green-50 p-3 rounded">{selectedReport.suggested_value || 'Not specified'}</p>
                    </div>
                  </div>
                )}

                {selectedReport.evidence_urls && selectedReport.evidence_urls.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Evidence URLs</Label>
                    <div className="space-y-2">
                      {selectedReport.evidence_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.additional_notes && (
                  <div>
                    <Label className="text-sm font-medium">Additional Notes</Label>
                    <p className="text-sm bg-muted p-3 rounded">{selectedReport.additional_notes}</p>
                  </div>
                )}
              </div>

              {/* Edit Form */}
              <div className="border-t pt-4 space-y-4">
                <Label className="text-lg font-medium">Edit Data</Label>
                
                                 <div className="grid gap-4">
                   {currentData && Object.entries(currentData)
                     .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
                     .map(([key, value]) => {
                       const fieldValue = editFormData[key] || ''
                       const isFieldBeingCorrected = selectedReport?.field_name === key
                       
                       return (
                         <div key={key} className={isFieldBeingCorrected ? 'border-2 border-blue-200 rounded-lg p-3' : ''}>
                           <Label htmlFor={key} className={`flex items-center gap-2 ${isFieldBeingCorrected ? 'text-blue-600 font-semibold' : ''}`}>
                             {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                             {isFieldBeingCorrected && <Badge variant="outline" className="text-xs">Being Corrected</Badge>}
                           </Label>
                           {isFieldBeingCorrected && selectedReport?.suggested_value && (
                             <div className="mb-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                               <p className="text-sm text-green-700 font-medium">
                                 Suggested Value: {selectedReport.suggested_value}
                               </p>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => {
                                   const formattedValue = formatSuggestedValue(selectedReport.suggested_value || '', key)
                                   setEditFormData((prev: any) => ({ ...prev, [key]: formattedValue }))
                                   toast({
                                     title: "Suggestion Applied",
                                     description: "The suggested value has been applied to this field.",
                                     variant: "default"
                                   })
                                 }}
                                 className="text-green-700 hover:text-green-800 h-6 mt-1"
                               >
                                 <Check className="h-3 w-3 mr-1" />
                                 Apply Suggestion
                               </Button>
                             </div>
                           )}
                           {/* Use textarea for longer content */}
                           {(key.toLowerCase().includes('description') ||
                             key.toLowerCase().includes('notes') ||
                             key.toLowerCase().includes('requirements') ||
                             String(fieldValue).length > 100) ? (
                             <Textarea
                               id={key}
                               value={String(fieldValue)}
                               onChange={(e) => setEditFormData((prev: any) => ({ ...prev, [key]: e.target.value }))}
                               className={isFieldBeingCorrected ? 'border-blue-300 focus:border-blue-500' : ''}
                               rows={4}
                             />
                           ) : (
                             <Input
                               id={key}
                               value={String(fieldValue)}
                               onChange={(e) => setEditFormData((prev: any) => ({ ...prev, [key]: e.target.value }))}
                               className={isFieldBeingCorrected ? 'border-blue-300 focus:border-blue-500' : ''}
                               placeholder={
                                 key.toLowerCase().includes('url') || key.toLowerCase().includes('website') ? 
                                 "https://example.com" :
                                 key.toLowerCase().includes('email') ? 
                                 "user@example.com" :
                                 key.toLowerCase().includes('date') || key.toLowerCase().includes('deadline') ? 
                                 "YYYY-MM-DD" :
                                 key.toLowerCase().includes('tuition') || key.toLowerCase().includes('fee') ? 
                                 "50000" :
                                 ""
                               }
                             />
                           )}
                         </div>
                       )
                     })}
                 </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedData} disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 