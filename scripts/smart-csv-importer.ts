import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { z } from 'zod'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Types for import system
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

interface ImportOptions {
  mode: 'insert' | 'update' | 'upsert' | 'smart'
  batchSize: number
  skipErrors: boolean
  validateOnly: boolean
  mergeStrategy: 'replace' | 'merge' | 'preserve'
}

// Smart data parsing helpers
function parseNumber(value: any): number | null {
  if (value == null || value === '') return null
  const str = value.toString().replace(/[~()]/g, '').split(/[-,]/)[0]
  const num = parseInt(str.replace(/[^\d]/g, ''))
  return isNaN(num) ? null : num
}

function parsePercentage(value: any): number | null {
  if (value == null || value === '') return null
  const num = parseFloat(value.toString().replace('%', ''))
  return isNaN(num) ? null : num
}

function parseFloatValue(value: any): number | null {
  if (value == null || value === '') return null
  const num = parseFloat(value.toString())
  return isNaN(num) ? null : num
}

function extractCountryFromLocation(location: string): string {
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

// MBA School validation schema with legacy mapping
const MBASchoolSchema = z.object({
  name: z.string().min(2).transform(str => str.trim()),
  location: z.string().optional().transform(str => str?.trim() || null),
  country: z.string().optional().transform(str => str?.trim() || null),
  type: z.string().default('Full-time MBA'),
  duration: z.string().optional().transform(str => str?.trim() || '2 years'),
  
  // Rankings
  ranking: z.union([z.string().transform(parseNumber), z.number(), z.null()]).optional(),
  qs_mba_rank: z.union([z.string().transform(parseNumber), z.number(), z.null()]).optional(),
  ft_global_mba_rank: z.union([z.string().transform(parseNumber), z.number(), z.null()]).optional(),
  bloomberg_mba_rank: z.union([z.string().transform(parseNumber), z.number(), z.null()]).optional(),
  
  // Class metrics
  class_size: z.union([z.string().transform(parseNumber), z.number(), z.null()]).optional(),
  women_percentage: z.union([z.string().transform(parsePercentage), z.number(), z.null()]).optional(),
  
  // Test scores
  mean_gmat: z.union([z.string().transform(parseNumber), z.number(), z.null()]).optional(),
  mean_gpa: z.union([z.string().transform(parseFloatValue), z.number(), z.null()]).optional(),
  avg_gre: z.union([z.string().transform(parseNumber), z.number(), z.null()]).optional(),
  avg_work_exp_years: z.union([z.string().transform(parseFloatValue), z.number(), z.null()]).optional(),
  
  // Financial
  avg_starting_salary: z.string().optional().transform(str => str?.trim() || null),
  tuition: z.string().optional().transform(str => str?.trim() || null),
  total_cost: z.string().optional().transform(str => str?.trim() || null),
  application_fee: z.string().optional().transform(str => str?.trim() || null),
  weighted_salary: z.string().optional().transform(str => str?.trim() || null),
  
  // Employment
  employment_in_3_months_percent: z.union([z.string().transform(parsePercentage), z.number(), z.null()]).optional(),
  employment_rate: z.union([z.string().transform(parsePercentage), z.number(), z.null()]).optional(),
  
  // Boolean
  gmat_gre_waiver_available: z.union([
    z.string().transform(str => {
      if (!str) return false
      return ['yes', 'true', '1', 'y'].includes(str.toLowerCase())
    }),
    z.boolean()
  ]).optional(),
  
  // Text fields
  description: z.string().optional().transform(str => str?.trim() || null),
  application_deadlines: z.string().optional().transform(str => str?.trim() || null),
  class_profile: z.string().optional().transform(str => str?.trim() || null),
  admissions_rounds: z.string().optional().transform(str => str?.trim() || null),
  top_hiring_companies: z.string().optional().transform(str => str?.trim() || null),
  alumni_network_strength: z.string().optional().transform(str => str?.trim() || null),
  notable_alumni: z.string().optional().transform(str => str?.trim() || null),
  website: z.string().optional().transform(str => str?.trim() || null),
  
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  
  // Legacy CSV mappings
  'School Name': z.string().optional(),
  'Description': z.string().optional(),
  'Location': z.string().optional(),
  'Class Size': z.string().optional(),
  'Women': z.string().optional(),
  'Mean GMAT': z.string().optional(),
  'Mean GPA': z.string().optional(),
  'Avg GRE': z.string().optional(),
  'Avg Work Exp (Years)': z.string().optional(),
  'Avg Starting Salary': z.string().optional(),
  'Tuition (Total)': z.string().optional(),
  'Application Deadlines': z.string().optional(),
  'Application Fee': z.string().optional(),
  'GMAT/GRE Waiver Available': z.string().optional(),
  'Class Profile': z.string().optional(),
  'Admissions Rounds': z.string().optional(),
  'QS MBA Rank': z.string().optional(),
  'FT Global MBA Rank': z.string().optional(),
  'Bloomberg MBA Rank': z.string().optional(),
  'Employment in 3 Months (%)': z.string().optional(),
  'Weighted Salary ($)': z.string().optional(),
  'Top Hiring Companies': z.string().optional(),
  'Alumni Network Strength': z.string().optional(),
  'Notable Alumni': z.string().optional(),
}).transform((data) => {
  // Map legacy CSV headers to database fields
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
})

// Scholarship validation schema with legacy mapping
const ScholarshipSchema = z.object({
  name: z.string().min(2).transform(str => str.trim()),
  provider: z.string().min(2).transform(str => str.trim()),
  host_country: z.string().min(2).transform(str => str.trim()),
  
  description: z.string().optional().transform(str => str?.trim() || null),
  amount: z.string().optional().transform(str => str?.trim() || null),
  eligibility: z.string().optional().transform(str => str?.trim() || null),
  deadline: z.string().optional().transform(str => str?.trim() || null),
  application_url: z.string().optional().transform(str => str?.trim() || null),
  benefits: z.string().optional().transform(str => str?.trim() || null),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
  
  // Legacy mappings
  'Scholarship Name': z.string().optional(),
  'Host Organization': z.string().optional(),
  'Host Country': z.string().optional(),
  'Level of Study': z.string().optional(),
  'Latest Deadline (Approx.)': z.string().optional(),
  'Eligibility Criteria (Key Points)': z.string().optional(),
  'Benefits (Key Points)': z.string().optional(),
  'Official URL': z.string().optional(),
}).transform((data) => {
  return {
    name: data.name || data['Scholarship Name'] || '',
    provider: data.provider || data['Host Organization'] || '',
    host_country: data.host_country || data['Host Country'] || '',
    description: data.description || `${data.name || data['Scholarship Name']} offered by ${data.provider || data['Host Organization']}`,
    amount: data.amount,
    eligibility: data.eligibility || data['Eligibility Criteria (Key Points)'],
    deadline: data.deadline || data['Latest Deadline (Approx.)'],
    application_url: data.application_url || data['Official URL'],
    benefits: data.benefits || data['Benefits (Key Points)'],
    status: data.status || 'active',
    
    // Legacy compatibility
    title: data.name || data['Scholarship Name'] || '',
    organization: data.provider || data['Host Organization'] || '',
    country: data.host_country || data['Host Country'] || '',
    eligibility_criteria: data.eligibility || data['Eligibility Criteria (Key Points)'],
  }
})

// Smart Data Importer Class
class SmartDataImporter {
  private errors: ImportError[] = []
  private warnings: ImportError[] = []
  
  constructor(private options: ImportOptions) {}
  
  // MBA Schools import with smart duplicate detection and merging
  async importMBASchools(csvFilePath: string): Promise<ImportResult> {
    console.log('🚀 Starting smart MBA schools import...')
    this.clearMessages()
    
    try {
      const csvContent = readFileSync(csvFilePath, 'utf-8')
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
      
      console.log(`📊 Found ${records.length} rows in CSV`)
      
      // Get existing schools for duplicate detection
      const { data: existingSchools } = await supabase
        .from('mba_schools')
        .select('*')
      
      const existingMap = new Map((existingSchools || []).map(school => [
        this.generateMBAKey(school), school
      ]))
      
      console.log(`🔍 Found ${existingSchools?.length || 0} existing schools`)
      
      const processedRecords = []
      const updates = []
      
      for (let i = 0; i < records.length; i++) {
        try {
          const validatedData = MBASchoolSchema.parse(records[i])
          
          if (!validatedData.name) {
            this.addError(i + 2, 'name', 'School name is required', 'error')
            continue
          }
          
          const key = this.generateMBAKey(validatedData)
          const existingSchool = existingMap.get(key)
          
          if (existingSchool) {
            const updateData = this.smartMerge(existingSchool, validatedData)
            if (Object.keys(updateData).length > 0) {
              updates.push({
                id: existingSchool.id,
                updates: updateData,
                originalData: validatedData
              })
              this.addWarning(i + 2, undefined, `Will update: ${validatedData.name}`, 'info')
            } else {
              this.addWarning(i + 2, undefined, `No changes needed: ${validatedData.name}`, 'info')
            }
          } else {
            processedRecords.push(validatedData)
          }
          
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach(err => {
              this.addError(i + 2, err.path.join('.'), err.message, 'error')
            })
          } else {
            this.addError(i + 2, undefined, `Processing error: ${error}`, 'error')
          }
        }
      }
      
      if (this.options.validateOnly) {
        return this.generateResult(records.length, 0, 0, 0, 'Validation completed')
      }
      
      // Execute inserts and updates
      let insertedCount = 0
      let updatedCount = 0
      
      if (processedRecords.length > 0) {
        insertedCount = await this.batchInsertMBA(processedRecords)
      }
      
      if (updates.length > 0) {
        updatedCount = await this.batchUpdateMBA(updates)
      }
      
      const summary = `✅ MBA import: ${insertedCount} inserted, ${updatedCount} updated, ${this.errors.length} errors`
      console.log(summary)
      
      return this.generateResult(records.length, processedRecords.length + updates.length, insertedCount, updatedCount, summary)
      
    } catch (error) {
      console.error('❌ MBA import failed:', error)
      this.addError(1, 'file', `Import failed: ${error}`, 'error')
      return this.generateResult(0, 0, 0, 0, 'Import failed')
    }
  }
  
  // Scholarships import
  async importScholarships(csvFilePath: string): Promise<ImportResult> {
    console.log('🚀 Starting smart scholarships import...')
    this.clearMessages()
    
    try {
      const csvContent = readFileSync(csvFilePath, 'utf-8')
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
      
      console.log(`📊 Found ${records.length} rows in CSV`)
      
      // Get existing scholarships
      const { data: existingScholarships } = await supabase
        .from('scholarships')
        .select('*')
      
      const existingMap = new Map((existingScholarships || []).map(scholarship => [
        this.generateScholarshipKey(scholarship), scholarship
      ]))
      
      console.log(`🔍 Found ${existingScholarships?.length || 0} existing scholarships`)
      
      const processedRecords = []
      const updates = []
      
      for (let i = 0; i < records.length; i++) {
        try {
          const validatedData = ScholarshipSchema.parse(records[i])
          
          if (!validatedData.name) {
            this.addError(i + 2, 'name', 'Scholarship name is required', 'error')
            continue
          }
          
          const key = this.generateScholarshipKey(validatedData)
          const existingScholarship = existingMap.get(key)
          
          if (existingScholarship) {
            const updateData = this.smartMerge(existingScholarship, validatedData)
            if (Object.keys(updateData).length > 0) {
              updates.push({
                id: existingScholarship.id,
                updates: updateData,
                originalData: validatedData
              })
              this.addWarning(i + 2, undefined, `Will update: ${validatedData.name}`, 'info')
            } else {
              this.addWarning(i + 2, undefined, `No changes needed: ${validatedData.name}`, 'info')
            }
          } else {
            processedRecords.push(validatedData)
          }
          
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach(err => {
              this.addError(i + 2, err.path.join('.'), err.message, 'error')
            })
          } else {
            this.addError(i + 2, undefined, `Processing error: ${error}`, 'error')
          }
        }
      }
      
      if (this.options.validateOnly) {
        return this.generateResult(records.length, 0, 0, 0, 'Validation completed')
      }
      
      // Execute inserts and updates
      let insertedCount = 0
      let updatedCount = 0
      
      if (processedRecords.length > 0) {
        insertedCount = await this.batchInsertScholarships(processedRecords)
      }
      
      if (updates.length > 0) {
        updatedCount = await this.batchUpdateScholarships(updates)
      }
      
      const summary = `✅ Scholarships import: ${insertedCount} inserted, ${updatedCount} updated, ${this.errors.length} errors`
      console.log(summary)
      
      return this.generateResult(records.length, processedRecords.length + updates.length, insertedCount, updatedCount, summary)
      
    } catch (error) {
      console.error('❌ Scholarships import failed:', error)
      this.addError(1, 'file', `Import failed: ${error}`, 'error')
      return this.generateResult(0, 0, 0, 0, 'Import failed')
    }
  }
  
  // Helper methods
  private generateMBAKey(school: any): string {
    const name = school.name?.toLowerCase().trim().replace(/[^\w\s]/g, '') || ''
    const location = school.location?.toLowerCase().trim() || ''
    return `${name}|${location}`
  }
  
  private generateScholarshipKey(scholarship: any): string {
    const name = scholarship.name?.toLowerCase().trim().replace(/[^\w\s]/g, '') || ''
    const provider = scholarship.provider?.toLowerCase().trim() || 
                     scholarship.organization?.toLowerCase().trim() || ''
    return `${name}|${provider}`
  }
  
  private smartMerge(existing: any, incoming: any): any {
    const updates: any = {}
    
    for (const [key, value] of Object.entries(incoming)) {
      if (value === null || value === undefined || value === '') continue
      
      const existingValue = existing[key]
      
      if (this.options.mergeStrategy === 'replace') {
        if (existingValue !== value) {
          updates[key] = value
        }
      } else if (this.options.mergeStrategy === 'merge') {
        // Smart merge: update if existing is null/empty OR new value is more complete
        if (!existingValue || 
            (typeof value === 'string' && value.length > (existingValue?.length || 0)) ||
            (typeof value === 'number' && (!existingValue || existingValue === 0))) {
          updates[key] = value
        }
      } else if (this.options.mergeStrategy === 'preserve') {
        if (!existingValue) {
          updates[key] = value
        }
      }
    }
    
    return updates
  }
  
  private async batchInsertMBA(records: any[]): Promise<number> {
    let insertedCount = 0
    const batchSize = this.options.batchSize
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      try {
        const { data, error } = await supabase
          .from('mba_schools')
          .insert(batch)
          .select()
        
        if (error) {
          console.error(`❌ Batch insert failed:`, error)
          // Try individual inserts
          for (const record of batch) {
            try {
              const { error: singleError } = await supabase
                .from('mba_schools')
                .insert([record])
              
              if (!singleError) {
                insertedCount++
                console.log(`✅ Inserted: ${record.name}`)
              } else {
                this.addError(0, undefined, `Insert failed for ${record.name}: ${singleError.message}`, 'error')
              }
            } catch (err) {
              this.addError(0, undefined, `Insert failed for ${record.name}: ${err}`, 'error')
            }
          }
        } else {
          insertedCount += batch.length
          console.log(`✅ Inserted batch of ${batch.length} MBA schools`)
        }
      } catch (err) {
        console.error(`❌ Unexpected error:`, err)
      }
    }
    
    return insertedCount
  }
  
  private async batchUpdateMBA(updates: any[]): Promise<number> {
    let updatedCount = 0
    
    for (const update of updates) {
      try {
        const { error } = await supabase
          .from('mba_schools')
          .update(update.updates)
          .eq('id', update.id)
        
        if (!error) {
          updatedCount++
          console.log(`✅ Updated: ${update.originalData.name}`)
        } else {
          this.addError(0, undefined, `Update failed for ${update.originalData.name}: ${error.message}`, 'error')
        }
      } catch (err) {
        this.addError(0, undefined, `Update failed for ${update.originalData.name}: ${err}`, 'error')
      }
    }
    
    return updatedCount
  }
  
  private async batchInsertScholarships(records: any[]): Promise<number> {
    let insertedCount = 0
    const batchSize = this.options.batchSize
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      try {
        const { data, error } = await supabase
          .from('scholarships')
          .insert(batch)
          .select()
        
        if (error) {
          console.error(`❌ Batch insert failed:`, error)
          // Try individual inserts
          for (const record of batch) {
            try {
              const { error: singleError } = await supabase
                .from('scholarships')
                .insert([record])
              
              if (!singleError) {
                insertedCount++
                console.log(`✅ Inserted: ${record.name}`)
              } else {
                this.addError(0, undefined, `Insert failed for ${record.name}: ${singleError.message}`, 'error')
              }
            } catch (err) {
              this.addError(0, undefined, `Insert failed for ${record.name}: ${err}`, 'error')
            }
          }
        } else {
          insertedCount += batch.length
          console.log(`✅ Inserted batch of ${batch.length} scholarships`)
        }
      } catch (err) {
        console.error(`❌ Unexpected error:`, err)
      }
    }
    
    return insertedCount
  }
  
  private async batchUpdateScholarships(updates: any[]): Promise<number> {
    let updatedCount = 0
    
    for (const update of updates) {
      try {
        const { error } = await supabase
          .from('scholarships')
          .update(update.updates)
          .eq('id', update.id)
        
        if (!error) {
          updatedCount++
          console.log(`✅ Updated: ${update.originalData.name}`)
        } else {
          this.addError(0, undefined, `Update failed for ${update.originalData.name}: ${error.message}`, 'error')
        }
      } catch (err) {
        this.addError(0, undefined, `Update failed for ${update.originalData.name}: ${err}`, 'error')
      }
    }
    
    return updatedCount
  }
  
  private clearMessages() {
    this.errors = []
    this.warnings = []
  }
  
  private addError(row: number, field: string | undefined, message: string, severity: 'error' | 'warning' | 'info') {
    const error: ImportError = { row, field, message, severity }
    
    if (severity === 'error') {
      this.errors.push(error)
    } else {
      this.warnings.push(error)
    }
  }
  
  private addWarning(row: number, field: string | undefined, message: string, severity: 'error' | 'warning' | 'info') {
    this.addError(row, field, message, severity)
  }
  
  private generateResult(
    totalRows: number, 
    processedRows: number, 
    insertedRows: number, 
    updatedRows: number, 
    summary: string
  ): ImportResult {
    return {
      success: this.errors.length === 0,
      totalRows,
      processedRows,
      insertedRows,
      updatedRows,
      skippedRows: totalRows - processedRows,
      errors: this.errors,
      warnings: this.warnings,
      summary
    }
  }
  
  getDetailedReport(): string {
    let report = `📊 Import Report\n===============\n\n`
    
    if (this.errors.length > 0) {
      report += `❌ Errors (${this.errors.length}):\n`
      this.errors.forEach(error => {
        report += `  Row ${error.row}: ${error.field ? `[${error.field}] ` : ''}${error.message}\n`
      })
      report += `\n`
    }
    
    if (this.warnings.length > 0) {
      report += `⚠️  Warnings (${this.warnings.length}):\n`
      this.warnings.forEach(warning => {
        report += `  Row ${warning.row}: ${warning.field ? `[${warning.field}] ` : ''}${warning.message}\n`
      })
    }
    
    return report
  }
}

// Usage functions
export async function importMBASchoolsFromCSV(
  csvFilePath: string,
  options: Partial<ImportOptions> = {}
): Promise<ImportResult> {
  const importer = new SmartDataImporter({
    mode: 'smart',
    batchSize: 10,
    skipErrors: true,
    validateOnly: false,
    mergeStrategy: 'merge',
    ...options
  })
  
  const result = await importer.importMBASchools(csvFilePath)
  
  if (result.errors.length > 0 || result.warnings.length > 0) {
    console.log('\n' + importer.getDetailedReport())
  }
  
  return result
}

export async function importScholarshipsFromCSV(
  csvFilePath: string,
  options: Partial<ImportOptions> = {}
): Promise<ImportResult> {
  const importer = new SmartDataImporter({
    mode: 'smart',
    batchSize: 10,
    skipErrors: true,
    validateOnly: false,
    mergeStrategy: 'merge',
    ...options
  })
  
  const result = await importer.importScholarships(csvFilePath)
  
  if (result.errors.length > 0 || result.warnings.length > 0) {
    console.log('\n' + importer.getDetailedReport())
  }
  
  return result
}

export async function validateMBASchoolsCSV(csvFilePath: string): Promise<ImportResult> {
  return importMBASchoolsFromCSV(csvFilePath, { validateOnly: true })
}

export async function validateScholarshipsCSV(csvFilePath: string): Promise<ImportResult> {
  return importScholarshipsFromCSV(csvFilePath, { validateOnly: true })
}

// Main execution if run directly
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log(`
🚀 Smart CSV Importer Usage:
  
  npx ts-node scripts/smart-csv-importer.ts mba path/to/schools.csv [options]
  npx ts-node scripts/smart-csv-importer.ts validate-mba path/to/schools.csv
  
  Options:
    --mode=smart|insert|update|upsert
    --merge=replace|merge|preserve
    --batch-size=10
    `)
    process.exit(1)
  }
  
  const [type, filePath] = args
  const options: Partial<ImportOptions> = {}
  
  // Parse command line options
  args.slice(2).forEach(arg => {
    if (arg.startsWith('--mode=')) {
      options.mode = arg.split('=')[1] as any
    } else if (arg.startsWith('--merge=')) {
      options.mergeStrategy = arg.split('=')[1] as any
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.split('=')[1])
    }
  })
  
  async function main() {
    try {
      let result: ImportResult
      
      switch (type) {
        case 'mba':
          result = await importMBASchoolsFromCSV(filePath, options)
          break
        case 'scholarships':
          result = await importScholarshipsFromCSV(filePath, options)
          break
        case 'validate-mba':
          result = await validateMBASchoolsCSV(filePath)
          break
        case 'validate-scholarships':
          result = await validateScholarshipsCSV(filePath)
          break
        default:
          console.error(`❌ Unknown type: ${type}`)
          process.exit(1)
      }
      
      console.log(`\n📊 Final Result:`)
      console.log(`Success: ${result.success}`)
      console.log(`Total Rows: ${result.totalRows}`)
      console.log(`Processed: ${result.processedRows}`)
      console.log(`Inserted: ${result.insertedRows}`)
      console.log(`Updated: ${result.updatedRows}`)
      console.log(`Skipped: ${result.skippedRows}`)
      console.log(`Errors: ${result.errors.length}`)
      console.log(`Warnings: ${result.warnings.length}`)
      console.log(`Summary: ${result.summary}`)
      
      if (!result.success) {
        process.exit(1)
      }
      
    } catch (error) {
      console.error('❌ Script failed:', error)
      process.exit(1)
    }
  }
  
  main()
} 