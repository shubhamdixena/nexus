import { z } from 'zod'

// Base error types for data import operations
export enum ImportErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  DUPLICATE = 'DUPLICATE_ERROR',
  MISSING_REQUIRED = 'MISSING_REQUIRED_ERROR',
  CORRUPT_DATA = 'CORRUPT_DATA_ERROR',
  INCOMPLETE_DATA = 'INCOMPLETE_DATA_ERROR',
  FORMAT_ERROR = 'FORMAT_ERROR',
  TYPE_MISMATCH = 'TYPE_MISMATCH_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION_ERROR',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED_ERROR'
}

export enum ImportSeverity {
  WARNING = 'warning',    // Non-blocking issues that can be auto-corrected
  ERROR = 'error',        // Blocking issues that prevent import
  CRITICAL = 'critical'   // Critical issues that may affect data integrity
}

export interface ImportError {
  type: ImportErrorType
  severity: ImportSeverity
  message: string
  field?: string
  rowIndex?: number
  suggestedFix?: string
  originalValue?: any
  expectedFormat?: string
  context?: Record<string, any>
}

export interface ImportResult<T> {
  success: boolean
  data: T[]
  errors: ImportError[]
  warnings: ImportError[]
  stats: {
    totalRows: number
    validRows: number
    invalidRows: number
    duplicatesFound: number
    duplicatesResolved: number
    autoCorrections: number
  }
  summary: string
}

// Scholarship validation schema
export const ScholarshipImportSchema = z.object({
  // Required fields
  name: z.string()
    .min(2, 'Scholarship name must be at least 2 characters')
    .max(200, 'Scholarship name must be less than 200 characters')
    .transform(str => str.trim()),
  
  provider: z.string()
    .min(2, 'Provider/organization name must be at least 2 characters')
    .max(150, 'Provider name must be less than 150 characters')
    .transform(str => str.trim()),
  
  host_country: z.string()
    .min(2, 'Host country is required')
    .max(100, 'Country name too long')
    .transform(str => str.trim()),
  
  // Optional but recommended fields
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .transform(str => str?.trim() || null),
  
  amount: z.union([
    z.string().transform(str => {
      // Extract numeric value from string (handles $50,000, €25000, etc.)
      const match = str.match(/[\d,]+/);
      return match ? parseInt(match[0].replace(/,/g, '')) : null;
    }),
    z.number(),
    z.null()
  ]).optional(),
  
  eligibility: z.string()
    .max(1500, 'Eligibility criteria too long')
    .optional()
    .transform(str => str?.trim() || null),
  
  deadline: z.string()
    .optional()
    .transform(str => {
      if (!str) return null;
      // Attempt to parse various date formats
      const date = new Date(str.trim());
      return isNaN(date.getTime()) ? str.trim() : date.toISOString().split('T')[0];
    }),
  
  application_url: z.string()
    .url('Invalid URL format')
    .optional()
    .or(z.literal(''))
    .transform(str => str || null),
  
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
  
  benefits: z.string()
    .max(1000, 'Benefits description too long')
    .optional()
    .transform(str => str?.trim() || null),
  
  status: z.enum(['active', 'inactive', 'draft'])
    .default('active'),
  
  // Legacy field mappings for backward compatibility
  host_organization: z.string().optional(),
  level_of_study: z.string().optional(),
  eligibility_criteria: z.string().optional(),
  fully_funded: z.string().optional(),
  official_url: z.string().optional(),
  
}).transform((data) => {
  // Map legacy fields to new schema
  return {
    ...data,
    provider: data.provider || data.host_organization || '',
    degree_level: data.degree_level || (data.level_of_study ? [data.level_of_study] : null),
    eligibility: data.eligibility || data.eligibility_criteria || null,
    application_url: data.application_url || data.official_url || null,
  };
});

export type ScholarshipImportData = z.infer<typeof ScholarshipImportSchema>;

// Data import validator class
export class DataImportValidator<T> {
  private schema: z.ZodSchema<T>;
  private duplicateCheckFields: string[];
  private requiredFields: string[];

  constructor(
    schema: z.ZodSchema<T>,
    duplicateCheckFields: string[] = [],
    requiredFields: string[] = []
  ) {
    this.schema = schema;
    this.duplicateCheckFields = duplicateCheckFields;
    this.requiredFields = requiredFields;
  }

  // Main validation method
  async validateImportData(
    rawData: any[],
    options: {
      skipDuplicates?: boolean;
      autoCorrect?: boolean;
      maxErrors?: number;
      existingData?: T[];
    } = {}
  ): Promise<ImportResult<T>> {
    const {
      skipDuplicates = true,
      autoCorrect = true,
      maxErrors = 100,
      existingData = []
    } = options;

    const validData: T[] = [];
    const errors: ImportError[] = [];
    const warnings: ImportError[] = [];
    const duplicatesFound: Set<string> = new Set();
    let autoCorrections = 0;

    for (let index = 0; index < rawData.length; index++) {
      const row = rawData[index];
      
      try {
        // Check for completely empty rows
        if (this.isEmptyRow(row)) {
          warnings.push({
            type: ImportErrorType.INCOMPLETE_DATA,
            severity: ImportSeverity.WARNING,
            message: 'Empty row skipped',
            rowIndex: index + 1
          });
          continue;
        }

        // Auto-correct common issues
        const correctedRow = autoCorrect ? this.autoCorrectData(row, index) : row;
        if (correctedRow !== row) autoCorrections++;

        // Validate against schema
        const validatedData = this.schema.parse(correctedRow);

        // Check for required fields
        const missingFields = this.checkRequiredFields(validatedData);
        if (missingFields.length > 0) {
          errors.push({
            type: ImportErrorType.MISSING_REQUIRED,
            severity: ImportSeverity.ERROR,
            message: `Missing required fields: ${missingFields.join(', ')}`,
            rowIndex: index + 1,
            context: { missingFields }
          });
          continue;
        }

        // Check for duplicates
        const duplicateKey = this.generateDuplicateKey(validatedData);
        const isDuplicate = duplicatesFound.has(duplicateKey) || 
                           this.checkExistingDuplicates(validatedData, existingData);

        if (isDuplicate) {
          duplicatesFound.add(duplicateKey);
          if (skipDuplicates) {
            warnings.push({
              type: ImportErrorType.DUPLICATE,
              severity: ImportSeverity.WARNING,
              message: 'Duplicate entry skipped',
              rowIndex: index + 1,
              suggestedFix: 'Remove duplicate or modify unique fields'
            });
            continue;
          } else {
            errors.push({
              type: ImportErrorType.DUPLICATE,
              severity: ImportSeverity.ERROR,
              message: 'Duplicate entry found',
              rowIndex: index + 1,
              suggestedFix: 'Remove duplicate or modify unique fields'
            });
            continue;
          }
        }

        duplicatesFound.add(duplicateKey);
        validData.push(validatedData);

      } catch (error) {
        const importError = this.processValidationError(error, index, row);
        errors.push(importError);

        // Stop processing if too many errors
        if (errors.length >= maxErrors) {
          errors.push({
            type: ImportErrorType.QUOTA_EXCEEDED,
            severity: ImportSeverity.CRITICAL,
            message: `Too many errors encountered. Processing stopped at row ${index + 1}`,
            rowIndex: index + 1
          });
          break;
        }
      }
    }

    const stats = {
      totalRows: rawData.length,
      validRows: validData.length,
      invalidRows: errors.filter(e => e.severity === ImportSeverity.ERROR).length,
      duplicatesFound: duplicatesFound.size,
      duplicatesResolved: warnings.filter(w => w.type === ImportErrorType.DUPLICATE).length,
      autoCorrections
    };

    return {
      success: errors.filter(e => e.severity === ImportSeverity.ERROR).length === 0,
      data: validData,
      errors: errors.filter(e => e.severity === ImportSeverity.ERROR),
      warnings: [...warnings, ...errors.filter(e => e.severity === ImportSeverity.WARNING)],
      stats,
      summary: this.generateSummary(stats, errors, warnings)
    };
  }

  private isEmptyRow(row: any): boolean {
    if (!row || typeof row !== 'object') return true;
    return Object.values(row).every(value => 
      value === null || value === undefined || value === ''
    );
  }

  private autoCorrectData(row: any, index: number): any {
    const corrected = { ...row };

    // Auto-correct common issues
    Object.keys(corrected).forEach(key => {
      const value = corrected[key];
      
      if (typeof value === 'string') {
        // Trim whitespace
        corrected[key] = value.trim();
        
        // Fix common URL issues
        if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) {
          if (value && !value.startsWith('http')) {
            corrected[key] = `https://${value}`;
          }
        }
        
        // Standardize boolean-like values
        if (key.toLowerCase().includes('funded')) {
          const normalized = value.toLowerCase();
          if (['yes', 'true', '1', 'fully', 'full'].includes(normalized)) {
            corrected[key] = 'Yes';
          } else if (['no', 'false', '0', 'partial', 'partially'].includes(normalized)) {
            corrected[key] = 'Partial';
          }
        }
        
        // Clean HTML entities
        if (value.includes('&lt;') || value.includes('&gt;')) {
          corrected[key] = value
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        }
      }
    });

    return corrected;
  }

  private checkRequiredFields(data: any): string[] {
    return this.requiredFields.filter(field => 
      !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
    );
  }

  private generateDuplicateKey(data: any): string {
    if (this.duplicateCheckFields.length === 0) return JSON.stringify(data);
    
    const keyParts = this.duplicateCheckFields.map(field => 
      String(data[field] || '').toLowerCase().trim()
    );
    return keyParts.join('|');
  }

  private checkExistingDuplicates(data: any, existingData: T[]): boolean {
    const newKey = this.generateDuplicateKey(data);
    return existingData.some(existing => 
      this.generateDuplicateKey(existing) === newKey
    );
  }

  private processValidationError(error: any, index: number, row: any): ImportError {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return {
        type: ImportErrorType.VALIDATION,
        severity: ImportSeverity.ERROR,
        message: firstIssue.message,
        field: firstIssue.path.join('.'),
        rowIndex: index + 1,
        originalValue: firstIssue.received,
        expectedFormat: this.getExpectedFormat(firstIssue.code),
        suggestedFix: this.getSuggestedFix(firstIssue)
      };
    }

    return {
      type: ImportErrorType.CORRUPT_DATA,
      severity: ImportSeverity.ERROR,
      message: error.message || 'Unknown validation error',
      rowIndex: index + 1,
      context: { row }
    };
  }

  private getExpectedFormat(zodErrorCode: string): string {
    const formatMap: Record<string, string> = {
      'invalid_type': 'Correct data type',
      'invalid_string': 'Valid string',
      'invalid_number': 'Valid number',
      'invalid_date': 'Valid date (YYYY-MM-DD)',
      'invalid_url': 'Valid URL (https://example.com)',
      'too_small': 'Minimum length/value',
      'too_big': 'Maximum length/value'
    };
    return formatMap[zodErrorCode] || 'Valid format';
  }

  private getSuggestedFix(issue: z.ZodIssue): string {
    switch (issue.code) {
      case 'invalid_url':
        return 'Ensure URL starts with http:// or https://';
      case 'invalid_date':
        return 'Use format: YYYY-MM-DD or MM/DD/YYYY';
      case 'too_small':
        return `Minimum ${issue.minimum} characters required`;
      case 'too_big':
        return `Maximum ${issue.maximum} characters allowed`;
      case 'invalid_type':
        return `Expected ${issue.expected}, got ${issue.received}`;
      default:
        return 'Check data format and try again';
    }
  }

  private generateSummary(
    stats: ImportResult<T>['stats'], 
    errors: ImportError[], 
    warnings: ImportError[]
  ): string {
    const { totalRows, validRows, invalidRows, duplicatesFound, autoCorrections } = stats;
    
    let summary = `Import Summary: ${validRows}/${totalRows} rows processed successfully`;
    
    if (invalidRows > 0) {
      summary += `, ${invalidRows} rows failed validation`;
    }
    
    if (duplicatesFound > 0) {
      summary += `, ${duplicatesFound} duplicates handled`;
    }
    
    if (autoCorrections > 0) {
      summary += `, ${autoCorrections} auto-corrections applied`;
    }
    
    if (warnings.length > 0) {
      summary += `, ${warnings.length} warnings generated`;
    }

    return summary;
  }
}

// Scholarship-specific validator
export const scholarshipValidator = new DataImportValidator(
  ScholarshipImportSchema,
  ['name', 'provider'], // Fields to check for duplicates
  ['name', 'provider', 'host_country'] // Required fields
);

// Export utility functions
export function createImportTemplate(entityType: 'scholarship' | 'university' | 'sop' = 'scholarship') {
  const templates = {
    scholarship: {
      name: "Example Scholarship Name",
      provider: "University of Example",
      host_country: "United States",
      description: "Full scholarship for outstanding students pursuing graduate studies in STEM fields",
      amount: "50000",
      eligibility: "Minimum GPA 3.5, demonstrated leadership experience, strong research background",
      deadline: "2024-12-31",
      application_url: "https://example.edu/scholarships/apply",
      field_of_study: "Engineering,Computer Science",
      degree_level: "Masters,PhD",
      countries: "United States,Canada",
      benefits: "Full tuition, monthly stipend of $2000, health insurance coverage",
      status: "active",
      // Legacy field examples for backward compatibility
      host_organization: "University of Example",
      level_of_study: "Masters",
      eligibility_criteria: "Strong academic record required",
      fully_funded: "Yes",
      official_url: "https://example.edu/scholarships"
    }
  };

  return templates[entityType];
}

// Error recovery strategies
export class ImportErrorRecovery {
  static async handleCorruptData(error: ImportError, originalRow: any): Promise<any> {
    // Attempt to recover corrupt data
    if (error.type === ImportErrorType.CORRUPT_DATA) {
      try {
        // Try to clean and re-parse the data
        const cleaned = this.cleanCorruptData(originalRow);
        return cleaned;
      } catch {
        return null;
      }
    }
    return null;
  }

  static cleanCorruptData(row: any): any {
    if (typeof row === 'string') {
      try {
        // Try to parse as JSON
        return JSON.parse(row);
      } catch {
        // Try to parse as CSV-like string
        return this.parseCSVLikeString(row);
      }
    }
    return row;
  }

  private static parseCSVLikeString(str: string): any {
    const values = str.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const commonFields = ['name', 'provider', 'country', 'amount', 'deadline'];
    
    const result: any = {};
    commonFields.forEach((field, index) => {
      if (values[index]) {
        result[field] = values[index];
      }
    });
    
    return result;
  }

  static suggestFieldMapping(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    const fieldMappings = {
      'name': ['title', 'scholarship_name', 'program_name', 'scholarship_title'],
      'provider': ['organization', 'university', 'host_organization', 'institution'],
      'host_country': ['country', 'location', 'host_country'],
      'amount': ['value', 'funding', 'award_amount', 'scholarship_amount'],
      'deadline': ['due_date', 'application_deadline', 'closing_date'],
      'eligibility': ['requirements', 'criteria', 'eligibility_criteria'],
      'application_url': ['url', 'website', 'apply_url', 'official_url'],
      'description': ['details', 'summary', 'overview'],
    };

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      for (const [standardField, variants] of Object.entries(fieldMappings)) {
        if (variants.some(variant => normalizedHeader.includes(variant))) {
          mapping[header] = standardField;
          break;
        }
      }
    });

    return mapping;
  }
} 