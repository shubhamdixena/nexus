import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'

interface ExcelScholarshipData {
  'Scholarship Name'?: string
  'Host Organization'?: string
  'Host Country'?: string
  'Level of Study'?: string
  'Latest Deadline (Approx.)'?: string
  'Eligibility Criteria (Key Points)'?: string
  'Benefits (Key Points)'?: string
  'Fully Funded?'?: string
  'Official URL'?: string
}

function cleanHtmlContent(text: string | undefined): string | null {
  if (!text) return null;
  
  return text
    .replace(/&lt;br&gt;|&lt;br\s*\/&gt;|<br>|<br\s*\/>/gi, '\n')
    .replace(/&lt;[^&gt;]*&gt;|<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapExcelToScholarship(row: ExcelScholarshipData) {
  return {
    name: cleanHtmlContent(row['Scholarship Name']),
    provider: cleanHtmlContent(row['Host Organization']),
    description: `${cleanHtmlContent(row['Scholarship Name'])} offered by ${cleanHtmlContent(row['Host Organization'])}`,
    amount: null, // Will need to be extracted from benefits if needed
    eligibility: cleanHtmlContent(row['Eligibility Criteria (Key Points)']),
    deadline: cleanHtmlContent(row['Latest Deadline (Approx.)']),
    application_url: cleanHtmlContent(row['Official URL']),
    field_of_study: null, // Can be extracted from scholarship name if needed
    degree_level: row['Level of Study'] ? [cleanHtmlContent(row['Level of Study'])] : null,
    countries: row['Host Country'] ? [cleanHtmlContent(row['Host Country'])] : null,
    benefits: cleanHtmlContent(row['Benefits (Key Points)']),
    status: 'active'
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the uploaded file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Read Excel file
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelScholarshipData[]

    console.log(`Processing ${jsonData.length} scholarship records`)

    // Process and validate data
    const scholarships = []
    const errors = []

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i]
      
      try {
        const scholarship = mapExcelToScholarship(row)
        
        // Basic validation
        if (!scholarship.name) {
          errors.push(`Row ${i + 2}: Missing scholarship name`)
          continue
        }
        
        if (!scholarship.provider) {
          errors.push(`Row ${i + 2}: Missing provider/organization`)
          continue
        }
        
        scholarships.push(scholarship)
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Processing error'}`)
      }
    }

    console.log(`${scholarships.length} valid scholarships processed`)
    console.log(`${errors.length} validation errors`)

    // Batch insert to Supabase
    if (scholarships.length > 0) {
      const { data, error } = await supabase
        .from('scholarships')
        .insert(scholarships)
        .select()

      if (error) {
        console.error('Supabase insert error:', error)
        return NextResponse.json(
          { 
            error: 'Database insertion failed', 
            details: error.message,
            processed: 0,
            total: jsonData.length,
            validationErrors: errors
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${data?.length || 0} scholarships`,
        processed: data?.length || 0,
        total: jsonData.length,
        validationErrors: errors,
        inserted: data?.length || 0
      })
    } else {
      return NextResponse.json(
        { 
          error: 'No valid scholarships to import',
          processed: 0,
          total: jsonData.length,
          validationErrors: errors
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { 
        error: 'Server error during bulk upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 