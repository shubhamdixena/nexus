import { createClient } from '@/lib/supabase/client'
import { parse } from 'csv-parse/sync'
import { z } from 'zod'
import { readFileSync } from 'fs'
import type { ImportError, ImportResult, ImportOptions } from './smart-data-importer'
import { extractCountryFromLocation, parseNumber, parsePercentage, parseFloatValue } from './smart-data-importer'

// MBA School validation schema
const MBASchoolImportSchema = z.object({
  name: z.string().min(2).max(200).transform(str => str.trim()),
  location: z.string().optional().transform(str => str?.trim() || null),
  country: z.string().optional().transform(str => str?.trim() || null),
  type: z.string().default('Full-time MBA').transform(str => str.trim()),
  duration: z.string().optional().transform(str => str?.trim() || null),
  
  // Rankings with smart parsing
  ranking: z.union([
    z.string().transform(str => parseNumber(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  qs_mba_rank: z.union([
    z.string().transform(str => parseNumber(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  ft_global_mba_rank: z.union([
    z.string().transform(str => parseNumber(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  bloomberg_mba_rank: z.union([
    z.string().transform(str => parseNumber(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  // Class metrics
  class_size: z.union([
    z.string().transform(str => parseNumber(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  women_percentage: z.union([
    z.string().transform(str => parsePercentage(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  // Test scores
  mean_gmat: z.union([
    z.string().transform(str => parseNumber(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  mean_gpa: z.union([
    z.string().transform(str => parseFloatValue(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  avg_gre: z.union([
    z.string().transform(str => parseNumber(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  avg_work_exp_years: z.union([
    z.string().transform(str => parseFloatValue(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  // Financial info
  avg_starting_salary: z.string().optional().transform(str => str?.trim() || null),
  tuition: z.string().optional().transform(str => str?.trim() || null),
  total_cost: z.string().optional().transform(str => str?.trim() || null),
  application_fee: z.string().optional().transform(str => str?.trim() || null),
  weighted_salary: z.string().optional().transform(str => str?.trim() || null),
  
  // Employment stats
  employment_in_3_months_percent: z.union([
    z.string().transform(str => parsePercentage(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  employment_rate: z.union([
    z.string().transform(str => parsePercentage(str)),
    z.number(),
    z.null()
  ]).optional(),
  
  // Boolean fields
  gmat_gre_waiver_available: z.union([
    z.string().transform(str => {
      if (!str) return false;
      return ['yes', 'true', '1', 'y'].includes(str.toLowerCase());
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
  
  // Legacy CSV field mappings for backward compatibility
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
  // Smart mapping of legacy CSV headers to database fields
  const mapped = {
    name: data.name || data['School Name'] || '',
    description: data.description || data['Description'] || null,
    location: data.location || data['Location'] || null,
    country: data.country || extractCountryFromLocation(data.location || data['Location'] || ''),
    type: data.type || 'Full-time MBA',
    duration: data.duration || '2 years',
    ranking: data.ranking || 
             data.qs_mba_rank || 
             data.ft_global_mba_rank || 
             data.bloomberg_mba_rank || 
             parseNumber(data['QS MBA Rank']) ||
             parseNumber(data['FT Global MBA Rank']) ||
             parseNumber(data['Bloomberg MBA Rank']) ||
             null,
    class_size: data.class_size || parseNumber(data['Class Size']),
    women_percentage: data.women_percentage || parsePercentage(data['Women']),
    mean_gmat: data.mean_gmat || parseNumber(data['Mean GMAT']),
    mean_gpa: data.mean_gpa || parseFloatValue(data['Mean GPA']),
    avg_gre: data.avg_gre || parseNumber(data['Avg GRE']),
    avg_work_exp_years: data.avg_work_exp_years || parseFloatValue(data['Avg Work Exp (Years)']),
    avg_starting_salary: data.avg_starting_salary || data['Avg Starting Salary'] || null,
    tuition: data.tuition || data['Tuition (Total)'] || null,
    application_deadlines: data.application_deadlines || data['Application Deadlines'] || null,
    application_fee: data.application_fee || data['Application Fee'] || null,
    gmat_gre_waiver_available: data.gmat_gre_waiver_available || 
                              (data['GMAT/GRE Waiver Available']?.toLowerCase() === 'yes') || 
                              false,
    class_profile: data.class_profile || data['Class Profile'] || null,
    admissions_rounds: data.admissions_rounds || data['Admissions Rounds'] || null,
    qs_mba_rank: data.qs_mba_rank || parseNumber(data['QS MBA Rank']),
    ft_global_mba_rank: data.ft_global_mba_rank || parseNumber(data['FT Global MBA Rank']),
    bloomberg_mba_rank: data.bloomberg_mba_rank || parseNumber(data['Bloomberg MBA Rank']),
    employment_in_3_months_percent: data.employment_in_3_months_percent || 
                                   parsePercentage(data['Employment in 3 Months (%)']),
    weighted_salary: data.weighted_salary || data['Weighted Salary ($)'] || null,
    top_hiring_companies: data.top_hiring_companies || data['Top Hiring Companies'] || null,
    alumni_network_strength: data.alumni_network_strength || data['Alumni Network Strength'] || null,
    notable_alumni: data.notable_alumni || data['Notable Alumni'] || null,
    website: data.website || null,
    status: data.status || 'active'
  };
  
  return mapped;
});

// Scholarship validation schema
const ScholarshipImportSchema = z.object({
  name: z.string().min(2).max(200).transform(str => str.trim()),
  provider: z.string().min(2).max(150).transform(str => str.trim()),
  host_country: z.string().min(2).max(100).transform(str => str.trim()),
  
  description: z.string().max(2000).optional().transform(str => str?.trim() || null),
  
  amount: z.union([
    z.string().transform(str => {
      if (!str) return null;
      const match = str.match(/[\d,]+/);
      const num = match ? parseInt(match[0].replace(/,/g, '')) : null;
      return num && !isNaN(num) ? num.toString() : str.trim();
    }),
    z.number().transform(n => n.toString()),
    z.null()
  ]).optional(),
  
  eligibility: z.string().max(1500).optional().transform(str => str?.trim() || null),
  
  deadline: z.string().optional().transform(str => {
    if (!str) return null;
    const cleaned = str.trim();
    const date = new Date(cleaned);
    return isNaN(date.getTime()) ? cleaned : date.toISOString().split('T')[0];
  }),
  
  application_url: z.string().optional().transform(str => {
    if (!str) return null;
    const cleaned = str.trim();
    try {
      if (cleaned.startsWith('http')) {
        new URL(cleaned);
        return cleaned;
      }
      return cleaned.startsWith('www.') ? `https://${cleaned}` : cleaned;
    } catch {
      return cleaned;
    }
  }),
  
  field_of_study: z.union([
    z.string().transform(str => str ? [str.trim()] : null),
    z.array(z.string()).transform(arr => arr.length > 0 ? arr : null),
    z.null()
  ]).optional(),
  
  degree_level: z.union([
    z.string().transform(str => str ? [str.trim()] : null),
    z.array(z.string()).transform(arr => arr.length > 0 ? arr : null),
    z.null()
  ]).optional(),
  
  countries: z.union([
    z.string().transform(str => str ? [str.trim()] : null),
    z.array(z.string()).transform(arr => arr.length > 0 ? arr : null),
    z.null()
  ]).optional(),
  
  benefits: z.string().max(1000).optional().transform(str => str?.trim() || null),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
  
  // Legacy field mappings for backward compatibility
  'Scholarship Name': z.string().optional(),
  'Host Organization': z.string().optional(),
  'Host Country': z.string().optional(),
  'Level of Study': z.string().optional(),
  'Latest Deadline (Approx.)': z.string().optional(),
  'Eligibility Criteria (Key Points)': z.string().optional(),
  'Benefits (Key Points)': z.string().optional(),
  'Fully Funded?': z.string().optional(),
  'Official URL': z.string().optional(),
  
}).transform((data) => {
  return {
    name: data.name || data['Scholarship Name'] || '',
    provider: data.provider || data['Host Organization'] || '',
    host_country: data.host_country || data['Host Country'] || '',
    description: data.description || `${data.name || data['Scholarship Name']} offered by ${data.provider || data['Host Organization']}`,
    amount: data.amount || null,
    eligibility: data.eligibility || data['Eligibility Criteria (Key Points)'] || null,
    deadline: data.deadline || data['Latest Deadline (Approx.)'] || null,
    application_url: data.application_url || data['Official URL'] || null,
    degree_level: data.degree_level || (data['Level of Study'] ? [data['Level of Study']] : null),
    countries: data.countries || (data.host_country ? [data.host_country] : null),
    benefits: data.benefits || data['Benefits (Key Points)'] || null,
    status: data.status || 'active',
    
    // Legacy field mappings for Supabase compatibility
    title: data.name || data['Scholarship Name'] || '',
    organization: data.provider || data['Host Organization'] || '',
    country: data.host_country || data['Host Country'] || '',
    eligibility_criteria: data.eligibility || data['Eligibility Criteria (Key Points)'] || null,
  };
});

// Main Smart Data Importer Class
export class SmartDataImporter {
  private supabase = createClient()
  private errors: ImportError[] = []
  private warnings: ImportError[] = []
  
  constructor(private options: Partial<ImportOptions> = {}) {
    this.options = {
      mode: 'smart',
      batchSize: 10,
      skipErrors: true,
      validateOnly: false,
      allowNewFields: true,
      mergeStrategy: 'merge',
      ...options
    }
  }
  
  async importMBASchools(csvFilePath: string): Promise<ImportResult> {
    console.log('🚀 Starting smart MBA schools import...')
    this.clearMessages()
    
    try {
      // Read and parse CSV
      const csvContent = readFileSync(csvFilePath, 'utf-8')
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
      
      console.log(`📊 Found ${records.length} rows in CSV`)
      
      // Get existing schools for duplicate detection
      const existingSchools = await this.getExistingMBASchools()
      const existingMap = new Map(existingSchools.map(school => [
        this.generateMBASchoolKey(school), school
      ]))
      
      console.log(`🔍 Found ${existingSchools.length} existing schools`)
      
      // Process records with validation
      const processedRecords = []
      const updates = []
      
      for (let i = 0; i < records.length; i++) {
        try {
          // Validate and transform data
          const validatedData = MBASchoolImportSchema.parse(records[i])
          
          if (!validatedData.name) {
            this.addError(i + 2, 'name', 'School name is required', 'error')
            continue
          }
          
          // Check for duplicates using smart key
          const key = this.generateMBASchoolKey(validatedData)
          const existingSchool = existingMap.get(key)
          
          if (existingSchool) {
            // Smart update logic
            const updateData = this.smartMergeData(existingSchool, validatedData)
            if (Object.keys(updateData).length > 0) {
              updates.push({
                id: existingSchool.id,
                updates: updateData,
                originalData: validatedData
              })
              this.addWarning(i + 2, undefined, `Will update existing school: ${validatedData.name}`, 'info')
            } else {
              this.addWarning(i + 2, undefined, `No changes needed for: ${validatedData.name}`, 'info')
            }
          } else {
            // New school
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
      
      // Execute database operations
      let insertedCount = 0
      let updatedCount = 0
      
      // Insert new schools in batches
      if (processedRecords.length > 0) {
        insertedCount = await this.batchInsertMBASchools(processedRecords)
      }
      
      // Update existing schools
      if (updates.length > 0) {
        updatedCount = await this.batchUpdateMBASchools(updates)
      }
      
      const summary = `✅ MBA Schools import completed: ${insertedCount} inserted, ${updatedCount} updated, ${this.errors.length} errors, ${this.warnings.length} warnings`
      console.log(summary)
      
      return this.generateResult(
        records.length,
        processedRecords.length + updates.length,
        insertedCount,
        updatedCount,
        summary
      )
      
    } catch (error) {
      console.error('❌ MBA Schools import failed:', error)
      this.addError(1, 'file', `Import failed: ${error}`, 'error')
      return this.generateResult(0, 0, 0, 0, 'Import failed')
    }
  }
  
  async importScholarships(csvFilePath: string): Promise<ImportResult> {
    console.log('🚀 Starting smart scholarships import...')
    this.clearMessages()
    
    try {
      // Read and parse CSV
      const csvContent = readFileSync(csvFilePath, 'utf-8')
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
      
      console.log(`📊 Found ${records.length} rows in CSV`)
      
      // Get existing scholarships for duplicate detection
      const existingScholarships = await this.getExistingScholarships()
      const existingMap = new Map(existingScholarships.map(scholarship => [
        this.generateScholarshipKey(scholarship), scholarship
      ]))
      
      console.log(`🔍 Found ${existingScholarships.length} existing scholarships`)
      
      // Process records with validation
      const processedRecords = []
      const updates = []
      
      for (let i = 0; i < records.length; i++) {
        try {
          // Validate and transform data
          const validatedData = ScholarshipImportSchema.parse(records[i])
          
          if (!validatedData.name) {
            this.addError(i + 2, 'name', 'Scholarship name is required', 'error')
            continue
          }
          
          // Check for duplicates using smart key
          const key = this.generateScholarshipKey(validatedData)
          const existingScholarship = existingMap.get(key)
          
          if (existingScholarship) {
            // Smart update logic
            const updateData = this.smartMergeData(existingScholarship, validatedData)
            if (Object.keys(updateData).length > 0) {
              updates.push({
                id: existingScholarship.id,
                updates: updateData,
                originalData: validatedData
              })
              this.addWarning(i + 2, undefined, `Will update existing scholarship: ${validatedData.name}`, 'info')
            } else {
              this.addWarning(i + 2, undefined, `No changes needed for: ${validatedData.name}`, 'info')
            }
          } else {
            // New scholarship
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
      
      // Execute database operations
      let insertedCount = 0
      let updatedCount = 0
      
      // Insert new scholarships in batches
      if (processedRecords.length > 0) {
        insertedCount = await this.batchInsertScholarships(processedRecords)
      }
      
      // Update existing scholarships
      if (updates.length > 0) {
        updatedCount = await this.batchUpdateScholarships(updates)
      }
      
      const summary = `✅ Scholarships import completed: ${insertedCount} inserted, ${updatedCount} updated, ${this.errors.length} errors, ${this.warnings.length} warnings`
      console.log(summary)
      
      return this.generateResult(
        records.length,
        processedRecords.length + updates.length,
        insertedCount,
        updatedCount,
        summary
      )
      
    } catch (error) {
      console.error('❌ Scholarships import failed:', error)
      this.addError(1, 'file', `Import failed: ${error}`, 'error')
      return this.generateResult(0, 0, 0, 0, 'Import failed')
    }
  }
  
  // Duplicate detection helpers
  private generateMBASchoolKey(school: any): string {
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
  
  // Smart merging logic with different strategies
  private smartMergeData(existing: any, incoming: any): any {
    const updates: any = {}
    
    for (const [key, value] of Object.entries(incoming)) {
      if (value === null || value === undefined || value === '') continue
      
      const existingValue = existing[key]
      
      if (this.options.mergeStrategy === 'replace') {
        // Always replace with new value
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
        // Only update if existing value is null/empty
        if (!existingValue) {
          updates[key] = value
        }
      }
    }
    
    return updates
  }
  
  // Database operations for MBA Schools
  private async getExistingMBASchools() {
    const { data, error } = await this.supabase
      .from('mba_schools')
      .select('*')
    
    if (error) throw error
    return data || []
  }
  
  private async batchInsertMBASchools(records: any[]): Promise<number> {
    let insertedCount = 0
    const batchSize = this.options.batchSize || 10
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      try {
        const { data, error } = await this.supabase
          .from('mba_schools')
          .insert(batch)
          .select()
        
        if (error) {
          console.error(`❌ Batch insert failed:`, error)
          // Try individual inserts for better error handling
          for (const record of batch) {
            try {
              const { error: singleError } = await this.supabase
                .from('mba_schools')
                .insert([record])
              
              if (singleError) {
                this.addError(0, undefined, `Insert failed for ${record.name}: ${singleError.message}`, 'error')
              } else {
                insertedCount++
                console.log(`✅ Inserted MBA school: ${record.name}`)
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
        console.error(`❌ Unexpected error in batch insert:`, err)
      }
    }
    
    return insertedCount
  }
  
  private async batchUpdateMBASchools(updates: any[]): Promise<number> {
    let updatedCount = 0
    
    for (const update of updates) {
      try {
        const { error } = await this.supabase
          .from('mba_schools')
          .update(update.updates)
          .eq('id', update.id)
        
        if (error) {
          this.addError(0, undefined, `Update failed for ${update.originalData.name}: ${error.message}`, 'error')
        } else {
          updatedCount++
          console.log(`✅ Updated MBA school: ${update.originalData.name}`)
        }
      } catch (err) {
        this.addError(0, undefined, `Update failed for ${update.originalData.name}: ${err}`, 'error')
      }
    }
    
    return updatedCount
  }
  
  // Database operations for Scholarships
  private async getExistingScholarships() {
    const { data, error } = await this.supabase
      .from('scholarships')
      .select('*')
    
    if (error) throw error
    return data || []
  }
  
  private async batchInsertScholarships(records: any[]): Promise<number> {
    let insertedCount = 0
    const batchSize = this.options.batchSize || 10
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      try {
        const { data, error } = await this.supabase
          .from('scholarships')
          .insert(batch)
          .select()
        
        if (error) {
          console.error(`❌ Batch insert failed:`, error)
          // Try individual inserts for better error handling
          for (const record of batch) {
            try {
              const { error: singleError } = await this.supabase
                .from('scholarships')
                .insert([record])
              
              if (singleError) {
                this.addError(0, undefined, `Insert failed for ${record.name}: ${singleError.message}`, 'error')
              } else {
                insertedCount++
                console.log(`✅ Inserted scholarship: ${record.name}`)
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
        console.error(`❌ Unexpected error in batch insert:`, err)
      }
    }
    
    return insertedCount
  }
  
  private async batchUpdateScholarships(updates: any[]): Promise<number> {
    let updatedCount = 0
    
    for (const update of updates) {
      try {
        const { error } = await this.supabase
          .from('scholarships')
          .update(update.updates)
          .eq('id', update.id)
        
        if (error) {
          this.addError(0, undefined, `Update failed for ${update.originalData.name}: ${error.message}`, 'error')
        } else {
          updatedCount++
          console.log(`✅ Updated scholarship: ${update.originalData.name}`)
        }
      } catch (err) {
        this.addError(0, undefined, `Update failed for ${update.originalData.name}: ${err}`, 'error')
      }
    }
    
    return updatedCount
  }
  
  // Error and message handling
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
  
  // Result generation
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
  
  // Utility methods
  getDetailedReport(): string {
    let report = `📊 Import Report\n`
    report += `===============\n\n`
    
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
  
  // Advanced features for data validation
  async validateMBASchoolsFile(csvFilePath: string): Promise<ImportResult> {
    const tempOptions = { ...this.options, validateOnly: true }
    const tempImporter = new SmartDataImporter(tempOptions)
    return await tempImporter.importMBASchools(csvFilePath)
  }
  
  async validateScholarshipsFile(csvFilePath: string): Promise<ImportResult> {
    const tempOptions = { ...this.options, validateOnly: true }
    const tempImporter = new SmartDataImporter(tempOptions)
    return await tempImporter.importScholarships(csvFilePath)
  }
  
  // Get statistics about existing data
  async getMBASchoolsStats() {
    const { data, error } = await this.supabase
      .from('mba_schools')
      .select('id, name, location, status, created_at')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    const stats = {
      total: data?.length || 0,
      active: data?.filter(s => s.status === 'active').length || 0,
      inactive: data?.filter(s => s.status === 'inactive').length || 0,
      countries: [...new Set(data?.map(s => s.location?.split(',').pop()?.trim()).filter(Boolean))].length,
      recentlyAdded: data?.filter(s => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return new Date(s.created_at) > oneWeekAgo
      }).length || 0
    }
    
    return stats
  }
  
  async getScholarshipsStats() {
    const { data, error } = await this.supabase
      .from('scholarships')
      .select('id, name, provider, status, created_at')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    const stats = {
      total: data?.length || 0,
      active: data?.filter(s => s.status === 'active').length || 0,
      inactive: data?.filter(s => s.status === 'inactive').length || 0,
      providers: [...new Set(data?.map(s => s.provider).filter(Boolean))].length,
      recentlyAdded: data?.filter(s => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return new Date(s.created_at) > oneWeekAgo
      }).length || 0
    }
    
    return stats
  }
} 