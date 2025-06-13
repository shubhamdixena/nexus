'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Database,
  RefreshCw,
  Download,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { parse } from 'csv-parse/sync'

interface ImportError {
  row: number
  field?: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

interface ImportResult {
  success: boolean
  totalRows: number
  processedRows: number
  insertedRows: number
  updatedRows: number
  skippedRows: number
  errors: ImportError[]
  warnings: ImportError[]
  summary: string
}

interface ImportStats {
  total_schools: number
  schools_updated: number
  new_schools_added: number
  avg_class_size: number
  avg_gmat_score: number
  avg_women_percentage: number
}

export default function SmartImportDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'mba' | 'scholarships'>('mba')
  const [mergeStrategy, setMergeStrategy] = useState<'replace' | 'merge' | 'preserve'>('merge')
  const [validateOnly, setValidateOnly] = useState(false)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Smart data parsing helpers
  const parseNumber = (value: any): number | null => {
    if (value == null || value === '') return null
    const str = value.toString().replace(/[~()]/g, '').split(/[-,]/)[0]
    const num = parseInt(str.replace(/[^\d]/g, ''))
    return isNaN(num) ? null : num
  }

  const parsePercentage = (value: any): number | null => {
    if (value == null || value === '') return null
    const num = parseFloat(value.toString().replace('%', ''))
    return isNaN(num) ? null : num
  }

  const parseFloatValue = (value: any): number | null => {
    if (value == null || value === '') return null
    const num = parseFloat(value.toString())
    return isNaN(num) ? null : num
  }

  const extractCountryFromLocation = (location: string): string => {
    if (!location) return ''
    
    const countryMappings = {
      'USA': ['USA', 'United States', 'US', 'America'],
      'UK': ['UK', 'United Kingdom', 'England', 'Britain'],
      'Canada': ['Canada'],
      'France': ['France'],
      'Spain': ['Spain'],
      'Germany': ['Germany'],
      'China': ['China'],
      'India': ['India'],
      'Switzerland': ['Switzerland'],
      'Italy': ['Italy'],
      'Singapore': ['Singapore'],
      'Australia': ['Australia'],
      'Netherlands': ['Netherlands', 'Holland'],
    }
    
    for (const [country, keywords] of Object.entries(countryMappings)) {
      if (keywords.some(keyword => location.includes(keyword))) {
        return country
      }
    }
    
    return location
  }

  // MBA School data transformation
  const transformMBASchoolData = (data: any) => {
    return {
      name: data.name || data['School Name'] || '',
      description: data.description || data['Description'] || null,
      location: data.location || data['Location'] || null,
      country: data.country || extractCountryFromLocation(data.location || data['Location'] || ''),
      type: data.type || 'Full-time MBA',
      duration: data.duration || '2 years',
      ranking: data.ranking || parseNumber(data['QS MBA Rank']) || parseNumber(data['FT Global MBA Rank']) || parseNumber(data['Bloomberg MBA Rank']),
      class_size: data.class_size || parseNumber(data['Class Size']),
      women_percentage: data.women_percentage || parsePercentage(data['Women']),
      mean_gmat: data.mean_gmat || parseNumber(data['Mean GMAT']),
      mean_gpa: data.mean_gpa || parseFloatValue(data['Mean GPA']),
      avg_gre: data.avg_gre || parseNumber(data['Avg GRE']),
      avg_work_exp_years: data.avg_work_exp_years || parseFloatValue(data['Avg Work Exp (Years)']),
      avg_starting_salary: data.avg_starting_salary || data['Avg Starting Salary'],
      tuition: data.tuition || data['Tuition (Total)'],
      application_deadlines: data.application_deadlines || data['Application Deadlines'],
      application_fee: data.application_fee || data['Application Fee'],
      gmat_gre_waiver_available: data.gmat_gre_waiver_available || (data['GMAT/GRE Waiver Available']?.toLowerCase() === 'yes'),
      class_profile: data.class_profile || data['Class Profile'],
      admissions_rounds: data.admissions_rounds || data['Admissions Rounds'],
      qs_mba_rank: data.qs_mba_rank || parseNumber(data['QS MBA Rank']),
      ft_global_mba_rank: data.ft_global_mba_rank || parseNumber(data['FT Global MBA Rank']),
      bloomberg_mba_rank: data.bloomberg_mba_rank || parseNumber(data['Bloomberg MBA Rank']),
      employment_in_3_months_percent: data.employment_in_3_months_percent || parsePercentage(data['Employment in 3 Months (%)']),
      weighted_salary: data.weighted_salary || data['Weighted Salary ($)'],
      top_hiring_companies: data.top_hiring_companies || data['Top Hiring Companies'],
      alumni_network_strength: data.alumni_network_strength || data['Alumni Network Strength'],
      notable_alumni: data.notable_alumni || data['Notable Alumni'],
      website: data.website,
      status: data.status || 'active'
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setResult(null)
    setCurrentStep('Analyzing file...')

    try {
      const text = await file.text()
      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })

      setPreviewData(records.slice(0, 5)) // Show first 5 rows for preview
      setCurrentStep(`File loaded: ${records.length} rows detected`)
    } catch (error) {
      console.error('Error parsing CSV:', error)
      setCurrentStep('Error parsing CSV file')
    }
  }

  const generateKey = (item: any, type: 'mba' | 'scholarships'): string => {
    if (type === 'mba') {
      const name = item.name?.toLowerCase().trim().replace(/[^\w\s]/g, '') || ''
      const location = item.location?.toLowerCase().trim() || ''
      return `${name}|${location}`
    } else {
      const name = item.name?.toLowerCase().trim().replace(/[^\w\s]/g, '') || ''
      const provider = item.provider?.toLowerCase().trim() || item.organization?.toLowerCase().trim() || ''
      return `${name}|${provider}`
    }
  }

  const smartMerge = (existing: any, incoming: any): any => {
    const updates: any = {}
    
    for (const [key, value] of Object.entries(incoming)) {
      if (value === null || value === undefined || value === '') continue
      
      const existingValue = existing[key]
      
      if (mergeStrategy === 'replace') {
        if (existingValue !== value) {
          updates[key] = value
        }
      } else if (mergeStrategy === 'merge') {
        // Smart merge: update if existing is null/empty OR new value is more complete
        if (!existingValue || 
            (typeof value === 'string' && value.length > (existingValue?.length || 0)) ||
            (typeof value === 'number' && (!existingValue || existingValue === 0))) {
          updates[key] = value
        }
      } else if (mergeStrategy === 'preserve') {
        if (!existingValue) {
          updates[key] = value
        }
      }
    }
    
    return updates
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setProgress(0)
    setCurrentStep('Starting import...')
    const errors: ImportError[] = []
    const warnings: ImportError[] = []

    try {
      const text = await selectedFile.text()
      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })

      setCurrentStep(`Processing ${records.length} rows...`)
      setProgress(10)

      // Get existing data for duplicate detection
      const tableName = importType === 'mba' ? 'mba_schools' : 'scholarships'
      const { data: existingData } = await supabase
        .from(tableName)
        .select('*')

      const existingMap = new Map((existingData || []).map(item => [
        generateKey(item, importType), item
      ]))

      setCurrentStep(`Found ${existingData?.length || 0} existing ${importType} records`)
      setProgress(20)

      const processedRecords = []
      const updates = []

      // Process each record
      for (let i = 0; i < records.length; i++) {
        try {
          const transformedData = importType === 'mba' 
            ? transformMBASchoolData(records[i])
            : records[i] // Add scholarship transformation here

          if (!transformedData.name) {
            errors.push({
              row: i + 2,
              field: 'name',
              message: `${importType === 'mba' ? 'School' : 'Scholarship'} name is required`,
              severity: 'error'
            })
            continue
          }

          const key = generateKey(transformedData, importType)
          const existingItem = existingMap.get(key)

          if (existingItem) {
            const updateData = smartMerge(existingItem, transformedData)
            if (Object.keys(updateData).length > 0) {
              updates.push({
                id: existingItem.id,
                updates: updateData,
                originalData: transformedData
              })
              warnings.push({
                row: i + 2,
                message: `Will update existing: ${transformedData.name}`,
                severity: 'info'
              })
            } else {
              warnings.push({
                row: i + 2,
                message: `No changes needed: ${transformedData.name}`,
                severity: 'info'
              })
            }
          } else {
            processedRecords.push(transformedData)
          }

        } catch (error) {
          errors.push({
            row: i + 2,
            message: `Processing error: ${error}`,
            severity: 'error'
          })
        }

        setProgress(20 + (i / records.length) * 40)
        setCurrentStep(`Processing row ${i + 1} of ${records.length}...`)
      }

      setCurrentStep(`Validation complete. ${processedRecords.length} new, ${updates.length} updates`)
      setProgress(60)

      if (validateOnly) {
        setResult({
          success: errors.length === 0,
          totalRows: records.length,
          processedRows: processedRecords.length + updates.length,
          insertedRows: 0,
          updatedRows: 0,
          skippedRows: records.length - (processedRecords.length + updates.length),
          errors,
          warnings,
          summary: `Validation completed: ${processedRecords.length} new records, ${updates.length} updates, ${errors.length} errors`
        })
        setIsLoading(false)
        return
      }

      // Execute inserts and updates
      let insertedCount = 0
      let updatedCount = 0

      setCurrentStep('Inserting new records...')

      // Insert new records in batches
      if (processedRecords.length > 0) {
        const batchSize = 10
        for (let i = 0; i < processedRecords.length; i += batchSize) {
          const batch = processedRecords.slice(i, i + batchSize)
          
          try {
            const { data, error } = await supabase
              .from(tableName)
              .insert(batch)
              .select()

            if (error) {
              console.error(`❌ Batch insert failed:`, error)
              // Try individual inserts
              for (const record of batch) {
                try {
                  const { error: singleError } = await supabase
                    .from(tableName)
                    .insert([record])

                  if (!singleError) {
                    insertedCount++
                  } else {
                    errors.push({
                      row: 0,
                      message: `Insert failed for ${record.name}: ${singleError.message}`,
                      severity: 'error'
                    })
                  }
                } catch (err) {
                  errors.push({
                    row: 0,
                    message: `Insert failed for ${record.name}: ${err}`,
                    severity: 'error'
                  })
                }
              }
            } else {
              insertedCount += batch.length
            }
          } catch (err) {
            console.error(`❌ Unexpected error:`, err)
          }

          setProgress(60 + (i / processedRecords.length) * 20)
          setCurrentStep(`Inserted ${insertedCount} of ${processedRecords.length} new records...`)
        }
      }

      setCurrentStep('Updating existing records...')

      // Update existing records
      if (updates.length > 0) {
        for (const [index, update] of updates.entries()) {
          try {
            const { error } = await supabase
              .from(tableName)
              .update(update.updates)
              .eq('id', update.id)

            if (!error) {
              updatedCount++
            } else {
              errors.push({
                row: 0,
                message: `Update failed for ${update.originalData.name}: ${error.message}`,
                severity: 'error'
              })
            }
          } catch (err) {
            errors.push({
              row: 0,
              message: `Update failed for ${update.originalData.name}: ${err}`,
              severity: 'error'
            })
          }

          setProgress(80 + (index / updates.length) * 15)
          setCurrentStep(`Updated ${updatedCount} of ${updates.length} existing records...`)
        }
      }

      // Generate import statistics
      if (importType === 'mba') {
        setCurrentStep('Generating statistics...')
        const { data: statsData } = await supabase.rpc('get_mba_import_stats', {
          school_names: [
            ...processedRecords.map(r => r.name),
            ...updates.map(u => u.originalData.name)
          ]
        }).single()
        
        if (statsData) {
          setImportStats(statsData)
        }
      }

      setProgress(100)
      setCurrentStep('Import completed!')

      const summary = `✅ ${importType.toUpperCase()} import completed: ${insertedCount} inserted, ${updatedCount} updated, ${errors.length} errors, ${warnings.length} warnings`

      setResult({
        success: errors.length === 0,
        totalRows: records.length,
        processedRows: processedRecords.length + updates.length,
        insertedRows: insertedCount,
        updatedRows: updatedCount,
        skippedRows: records.length - (processedRecords.length + updates.length),
        errors,
        warnings,
        summary
      })

    } catch (error) {
      console.error('❌ Import failed:', error)
      setCurrentStep('Import failed')
      setResult({
        success: false,
        totalRows: 0,
        processedRows: 0,
        insertedRows: 0,
        updatedRows: 0,
        skippedRows: 0,
        errors: [{ row: 1, message: `Import failed: ${error}`, severity: 'error' }],
        warnings: [],
        summary: 'Import failed'
      })
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentStep('')
    }
  }

  const downloadErrorReport = () => {
    if (!result) return

    const report = [
      '📊 Smart CSV Import Report',
      '==========================',
      '',
      `Import Type: ${importType.toUpperCase()}`,
      `File: ${selectedFile?.name}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Merge Strategy: ${mergeStrategy}`,
      '',
      '📈 SUMMARY:',
      `Total Rows: ${result.totalRows}`,
      `Processed: ${result.processedRows}`,
      `Inserted: ${result.insertedRows}`,
      `Updated: ${result.updatedRows}`,
      `Skipped: ${result.skippedRows}`,
      `Success: ${result.success}`,
      '',
      '❌ ERRORS:',
      ...result.errors.map(error => 
        `Row ${error.row}: ${error.field ? `[${error.field}] ` : ''}${error.message}`
      ),
      '',
      '⚠️ WARNINGS:',
      ...result.warnings.map(warning => 
        `Row ${warning.row}: ${warning.field ? `[${warning.field}] ` : ''}${warning.message}`
      )
    ].join('\n')

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smart-${importType}-import-report-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart CSV Import Dashboard</h1>
          <p className="text-lg text-gray-600">
            Advanced data import system with intelligent duplicate detection, smart merging, and comprehensive error handling
          </p>
        </div>

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Import Configuration
            </CardTitle>
            <CardDescription>
              Configure your CSV import settings for optimal data handling and processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="import-type">Data Type</Label>
                <select
                  id="import-type"
                  value={importType}
                  onChange={(e) => setImportType(e.target.value as 'mba' | 'scholarships')}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mba">MBA Schools</option>
                  <option value="scholarships">Scholarships</option>
                </select>
              </div>

              <div>
                <Label htmlFor="merge-strategy">Merge Strategy</Label>
                <select
                  id="merge-strategy"
                  value={mergeStrategy}
                  onChange={(e) => setMergeStrategy(e.target.value as 'replace' | 'merge' | 'preserve')}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="merge">Smart Merge (Recommended)</option>
                  <option value="replace">Replace Existing Data</option>
                  <option value="preserve">Preserve Existing Data</option>
                </select>
              </div>

              <div>
                <Label htmlFor="validation-mode">Mode</Label>
                <select
                  id="validation-mode"
                  value={validateOnly ? 'validate' : 'import'}
                  onChange={(e) => setValidateOnly(e.target.value === 'validate')}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="import">Import Data</option>
                  <option value="validate">Validate Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  <strong>Smart Merge:</strong> Updates empty fields with new data and chooses more complete values
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload & Processing
            </CardTitle>
            <CardDescription>
              Upload your CSV file and monitor the import progress in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {selectedFile ? (
                  <>
                    <strong>{selectedFile.name}</strong>
                    <br />
                    <span className="text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </>
                ) : (
                  'Select CSV file to upload'
                )}
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>

            {selectedFile && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleImport} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {validateOnly ? 'Validating...' : 'Importing...'}
                    </>
                  ) : (
                    <>
                      {validateOnly ? <Eye className="h-4 w-4 mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                      {validateOnly ? 'Validate Data' : 'Start Import'}
                    </>
                  )}
                </Button>
                
                {result && (
                  <Button onClick={downloadErrorReport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                )}
              </div>
            )}

            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{currentStep}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Data */}
        {previewData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Data Preview
              </CardTitle>
              <CardDescription>
                First 5 rows of your CSV file with smart field mapping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      {Object.keys(previewData[0] || {}).slice(0, 6).map((header) => (
                        <th key={header} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">
                          {header}
                          {importType === 'mba' && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {header === 'School Name' ? 'name' :
                               header === 'Class Size' ? 'class_size' :
                               header === 'Mean GMAT' ? 'mean_gmat' :
                               header === 'Location' ? 'location' :
                               'mapped'}
                            </Badge>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).slice(0, 6).map((value, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-sm">
                            {String(value).slice(0, 50)}
                            {String(value).length > 50 ? '...' : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Rows</p>
                      <p className="text-2xl font-bold">{result.totalRows}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Inserted</p>
                      <p className="text-2xl font-bold text-green-600">{result.insertedRows}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Updated</p>
                      <p className="text-2xl font-bold text-blue-600">{result.updatedRows}</p>
                    </div>
                    <RefreshCw className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Errors</p>
                      <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status Alert */}
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.summary}
                </AlertDescription>
              </div>
            </Alert>

            {/* Import Statistics */}
            {importStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Import Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-blue-600">Average Class Size</p>
                      <p className="text-xl font-bold text-blue-900">{importStats.avg_class_size}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-600">Average GMAT</p>
                      <p className="text-xl font-bold text-green-900">{importStats.avg_gmat_score}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-purple-600">Women Percentage</p>
                      <p className="text-xl font-bold text-purple-900">{importStats.avg_women_percentage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Errors and Warnings */}
            {(result.errors.length > 0 || result.warnings.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Import Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Errors ({result.errors.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {result.errors.map((error, index) => (
                          <div key={index} className="bg-red-50 p-3 rounded border border-red-200">
                            <p className="text-sm text-red-800">
                              <span className="font-medium">Row {error.row}:</span>
                              {error.field && <span className="text-red-600"> [{error.field}] </span>}
                              {error.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Warnings ({result.warnings.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {result.warnings.slice(0, 10).map((warning, index) => (
                          <div key={index} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              <span className="font-medium">Row {warning.row}:</span>
                              {warning.field && <span className="text-yellow-600"> [{warning.field}] </span>}
                              {warning.message}
                            </p>
                          </div>
                        ))}
                        {result.warnings.length > 10 && (
                          <p className="text-sm text-gray-600 text-center">
                            ... and {result.warnings.length - 10} more warnings
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 