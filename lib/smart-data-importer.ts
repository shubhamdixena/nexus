import { createClient } from '@/lib/supabase/client'
import { parse } from 'csv-parse/sync'
import { z } from 'zod'
import { readFileSync } from 'fs'

// Core types for the import system
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
  allowNewFields: boolean
  mergeStrategy: 'replace' | 'merge' | 'preserve'
}

// Helper functions for smart data parsing
function extractCountryFromLocation(location: string): string {
  if (!location) return '';
  
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
  };
  
  for (const [country, keywords] of Object.entries(countryMappings)) {
    if (keywords.some(keyword => location.includes(keyword))) {
      return country;
    }
  }
  
  return location;
}

function parseNumber(value: any): number | null {
  if (value == null || value === '') return null;
  const str = value.toString().replace(/[~()]/g, '').split(/[-,]/)[0];
  const num = parseInt(str.replace(/[^\d]/g, ''));
  return isNaN(num) ? null : num;
}

function parsePercentage(value: any): number | null {
  if (value == null || value === '') return null;
  const num = parseFloat(value.toString().replace('%', ''));
  return isNaN(num) ? null : num;
}

function parseFloatValue(value: any): number | null {
  if (value == null || value === '') return null;
  const num = parseFloat(value.toString());
  return isNaN(num) ? null : num;
}

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
  
  // Legacy CSV field mappings
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
  
  // Legacy field mappings
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
    
    // Legacy field mappings for backward compatibility
    title: data.name || data['Scholarship Name'] || '',
    organization: data.provider || data['Host Organization'] || '',
    country: data.host_country || data['Host Country'] || '',
    eligibility_criteria: data.eligibility || data['Eligibility Criteria (Key Points)'] || null,
  };
});

export { MBASchoolImportSchema, ScholarshipImportSchema, ImportError, ImportResult, ImportOptions };
export { extractCountryFromLocation, parseNumber, parsePercentage, parseFloatValue }; 