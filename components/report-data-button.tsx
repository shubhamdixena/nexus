"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Flag, Plus, X } from "lucide-react"
import { createClient } from "@/lib/supabaseClient"
import type { DataCorrectionReport } from "@/types"

interface ReportDataButtonProps {
  dataType: DataCorrectionReport['data_type']
  dataId?: string
  dataTable?: string
  currentData?: Record<string, any>
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function ReportDataButton({
  dataType,
  dataId,
  dataTable,
  currentData,
  variant = "ghost",
  size = "sm",
  className
}: ReportDataButtonProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [newEvidenceUrl, setNewEvidenceUrl] = useState("")
  const { toast } = useToast()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    issue_type: '' as DataCorrectionReport['issue_type'] | '',
    field_name: '',
    suggested_value: '',
    description: '',
    priority: 'medium' as DataCorrectionReport['priority']
  })

  const issueTypes = [
    { value: 'incorrect_info', label: 'Incorrect Information' },
    { value: 'outdated_info', label: 'Outdated Information' },
    { value: 'missing_info', label: 'Missing Information' },
    { value: 'broken_link', label: 'Broken Link' },
    { value: 'wrong_deadline', label: 'Wrong Deadline' },
    { value: 'other', label: 'Other' }
  ]

  // Field options based on data type with current values
  const getFieldOptions = () => {
    const formatValue = (value: any) => {
      if (value === null || value === undefined || value === '') return 'Not set'
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    }

    const createOption = (key: string, label: string, alternateKey?: string) => {
      const value = currentData?.[key] || currentData?.[alternateKey || '']
      const displayValue = formatValue(value)
      return {
        value: key,
        label: currentData ? `${label} (currently: ${displayValue})` : label,
        currentValue: value
      }
    }

    switch (dataType) {
      case 'university':
        return [
          createOption('ranking', 'University Ranking'),
          createOption('location', 'Location/Address'),
          createOption('website', 'Website URL'),
          createOption('description', 'University Description'),
          createOption('type', 'University Type'),
          createOption('programs', 'Programs Offered'),
          createOption('contact_info', 'Contact Information'),
          createOption('country', 'Country'),
          createOption('acceptance_rate', 'Acceptance Rate'),
          createOption('tuition_fees', 'Tuition Fees')
        ]
      case 'mba_school':
        return [
          // Basic Info (Real database columns only)
          createOption('business_school', 'Business School Name'),
          createOption('name', 'School Name'),
          createOption('description', 'School Description'),
          createOption('location', 'Location'),
          createOption('country', 'Country'),
          createOption('website', 'Website URL'),
          createOption('key_features', 'Key Features'),
          
          // Rankings (Real database columns)
          createOption('qs_mba_rank', 'QS MBA Ranking'),
          createOption('ft_global_mba_rank', 'Financial Times Global MBA Ranking'),
          createOption('bloomberg_mba_rank', 'Bloomberg MBA Ranking'),
          
          // Academic Requirements (Real database columns)
          createOption('mean_gmat', 'Mean GMAT Score'),
          createOption('mean_gpa', 'Mean GPA'),
          createOption('avg_gre', 'Average GRE Score'),
          createOption('gmat_gre_waiver_available', 'GMAT/GRE Waiver Available'),
          createOption('avg_work_exp_years', 'Average Work Experience (Years)'),
          
          // Financials (Fixed field names)
          createOption('tuition_total', 'Total Tuition Fees'),
          createOption('application_fee', 'Application Fee'),
          createOption('avg_starting_salary', 'Average Starting Salary'),
          createOption('weighted_salary', 'Weighted Salary'), // Fixed: removed _usd suffix
          
          // Program Details (Real database columns)
          createOption('program_duration', 'Program Duration'),
          createOption('class_size', 'Class Size'),
          createOption('credits_required', 'Credits Required'),
          createOption('core_curriculum', 'Core Curriculum'),
          createOption('stem_designation', 'STEM Designation'),
          
          // Specific Round Deadlines (Real data - these have actual values)
          createOption('r1_deadline', 'Round 1 Deadline'),
          createOption('r2_deadline', 'Round 2 Deadline'),
          createOption('r3_deadline', 'Round 3 Deadline'),
          createOption('r4_deadline', 'Round 4 Deadline'),
          createOption('r5_deadline', 'Round 5 Deadline'),
          createOption('admissions_rounds', 'Number of Admission Rounds'),
          
          // Demographics (Active fields only)
          createOption('women_percentage', 'Women Percentage'),
          createOption('international_students_percentage', 'International Students Percentage'),
          createOption('class_profile', 'Class Profile'),
          
          // Employment & Career (Real database columns)
          createOption('employment_in_3_months_percent', 'Employment Rate in 3 Months (%)'),
          createOption('top_hiring_companies', 'Top Hiring Companies'),
          createOption('alumni_network_strength', 'Alumni Network Strength'),
          
          // Notable Alumni (Structured fields - these have actual data)
          createOption('alumnus_1', 'Notable Alumnus 1'),
          createOption('alumnus_2', 'Notable Alumnus 2'),
          createOption('alumnus_3', 'Notable Alumnus 3'),
          createOption('alumnus_4', 'Notable Alumnus 4')
        ]
      case 'scholarship':
        return [
          createOption('amount', 'Scholarship Amount'),
          createOption('deadline', 'Application Deadline'),
          createOption('eligibility_criteria', 'Eligibility Requirements'),
          createOption('application_url', 'Application URL'),
          createOption('provider', 'Scholarship Provider'),
          createOption('field_of_study', 'Field of Study'),
          createOption('degree_level', 'Degree Level'),
          createOption('eligible_countries', 'Eligible Countries'),
          createOption('description', 'Description')
        ]
      case 'deadline':
        return [
          createOption('deadline_date', 'Deadline Date'),
          createOption('title', 'Deadline Title'),
          createOption('type', 'Deadline Type'),
          createOption('notes', 'Additional Notes'),
          createOption('description', 'Description')
        ]
      default:
        return [
          createOption('general', 'General Information'),
          createOption('contact', 'Contact Information'),
          createOption('website', 'Website/Links'),
          createOption('other', 'Other')
        ]
    }
  }

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ]

  const addEvidenceUrl = () => {
    if (newEvidenceUrl.trim() && !evidenceUrls.includes(newEvidenceUrl.trim())) {
      setEvidenceUrls([...evidenceUrls, newEvidenceUrl.trim()])
      setNewEvidenceUrl("")
    }
  }

  const removeEvidenceUrl = (url: string) => {
    setEvidenceUrls(evidenceUrls.filter(u => u !== url))
  }

  const handleSubmit = async () => {
    if (!formData.issue_type || !formData.field_name || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (issue type, what information is incorrect, and description).",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      console.log('Starting form submission...')
      console.log('Supabase client:', supabase)
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        toast({
          title: "Authentication Error",
          description: `There was an error checking your authentication status: ${authError.message}`,
          variant: "destructive"
        })
        return
      }
      
      if (!user) {
        console.log('No user found, redirecting to sign in...')
        toast({
          title: "Authentication Required",
          description: "Please sign in to report data issues. You will be redirected to the login page.",
          variant: "destructive"
        })
        // Redirect to sign in page
        window.location.href = '/auth/signin'
        return
      }

      console.log('User authenticated:', user.id)

      // Get current value for the selected field
      const selectedFieldOption = getFieldOptions().find(option => option.value === formData.field_name)
      const currentValue = selectedFieldOption?.currentValue || null

      const reportData = {
        reporter_id: user.id,
        data_type: dataType,
        data_id: dataId,
        data_table: dataTable,
        issue_type: formData.issue_type,
        field_name: formData.field_name || null,
        current_value: currentValue ? String(currentValue) : null, // Auto-detected from data
        suggested_value: formData.suggested_value || null,
        description: formData.description,
        evidence_urls: evidenceUrls.length > 0 ? evidenceUrls : null,
        additional_notes: null, // Removed from form
        priority: formData.priority
      }

      console.log('Submitting report data:', reportData)

      // Test connection first
      console.log('Testing Supabase connection...')
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
      
      if (testError) {
        console.error('Supabase connection test failed:', testError)
        toast({
          title: "Connection Error",
          description: `Unable to connect to database: ${testError.message}`,
          variant: "destructive"
        })
        return
      }
      
      console.log('Supabase connection test passed')

      const { data: insertedData, error } = await supabase
        .from('data_correction_reports')
        .insert([reportData])
        .select()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }

      console.log('Report submitted successfully:', insertedData)

      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this issue. Our team will review it soon.",
        variant: "default"
      })

      // Reset form
      setFormData({
        issue_type: '',
        field_name: '',
        suggested_value: '',
        description: '',
        priority: 'medium'
      })
      setEvidenceUrls([])
      setOpen(false)

    } catch (error) {
      console.error('Error submitting report:', error)
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      
      // Check if it's a Supabase error
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Supabase error code:', (error as any).code)
        console.error('Supabase error details:', (error as any).details)
        console.error('Supabase error hint:', (error as any).hint)
      }
      
      toast({
        title: "Submission Failed",
        description: `${error instanceof Error ? error.message : "There was an error submitting your report. Please try again."}`,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Flag className="h-4 w-4 mr-1" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Data Issue</DialogTitle>
          <DialogDescription>
            Help us improve data accuracy by reporting incorrect, outdated, or missing information.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Issue Type */}
          <div className="grid gap-2">
            <Label htmlFor="issue-type">Issue Type *</Label>
            <Select value={formData.issue_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, issue_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* What Information is Incorrect */}
          <div className="grid gap-2">
            <Label htmlFor="field-name">What information is incorrect? *</Label>
            <Select value={formData.field_name} onValueChange={(value: any) => setFormData(prev => ({ ...prev, field_name: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of information that needs correction" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {getFieldOptions().map(field => (
                  <SelectItem key={field.value} value={field.value} className="text-sm py-2">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{field.label.split(' (currently:')[0]}</span>
                      {field.currentValue && field.currentValue !== 'Not set' && (
                        <span className="text-xs text-muted-foreground truncate max-w-[400px]">
                          Currently: {typeof field.currentValue === 'string' && field.currentValue.length > 50 
                            ? field.currentValue.substring(0, 50) + '...' 
                            : field.currentValue}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Suggested Correction */}
          <div className="grid gap-2">
            <Label htmlFor="suggested-value">What should it be instead? (optional)</Label>
            <Input
              id="suggested-value"
              value={formData.suggested_value}
              onChange={(e) => setFormData(prev => ({ ...prev, suggested_value: e.target.value }))}
              placeholder="Enter the correct information"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the issue in detail..."
              className="min-h-[100px]"
            />
          </div>

          {/* Evidence URLs */}
          <div className="grid gap-2">
            <Label>Evidence URLs (optional)</Label>
            <div className="flex gap-2">
              <Input
                value={newEvidenceUrl}
                onChange={(e) => setNewEvidenceUrl(e.target.value)}
                placeholder="Add supporting URL (website, document, etc.)"
                onKeyPress={(e) => e.key === 'Enter' && addEvidenceUrl()}
              />
              <Button type="button" variant="outline" size="sm" onClick={addEvidenceUrl}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {evidenceUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {evidenceUrls.map((url, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <span className="truncate max-w-[200px]" title={url}>{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeEvidenceUrl(url)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={priority.color}>{priority.label}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}