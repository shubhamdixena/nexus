import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

// Configure Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to clean and parse numeric values
const parseNumber = (value: string): number | null => {
  if (!value || value.trim() === '' || value.toLowerCase() === 'not reported' || value === 'NA') {
    return null
  }
  const cleaned = value.replace(/[,$%]/g, '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

// Helper function to clean and parse salary values
const parseSalary = (value: string): string | null => {
  if (!value || value.trim() === '' || value.toLowerCase() === 'not reported' || value === 'NA') {
    return null
  }
  return value.trim()
}

// Helper function to extract location info
const extractLocation = (description: string): { location: string; country: string } => {
  // Extract location from description
  const locationMatch = description.match(/Located in ([^.]+)\./)
  if (locationMatch) {
    const location = locationMatch[1].trim()
    
    // Determine country
    if (location.includes(', USA') || location.includes(', US') || 
        location.includes('CA') || location.includes('NY') || 
        location.includes('MA') || location.includes('IL') ||
        location.match(/[A-Z]{2}$/)) {
      return { location, country: 'USA' }
    } else if (location.includes('UK') || location.includes('England') || 
               location.includes('London') || location.includes('Cambridge') || 
               location.includes('Edinburgh') || location.includes('Manchester') || 
               location.includes('Bath') || location.includes('Oxford')) {
      return { location, country: 'UK' }
    } else if (location.includes('France') || location.includes('Paris') || 
               location.includes('Lyon') || location.includes('Fontainebleau')) {
      return { location, country: 'France' }
    } else if (location.includes('Spain') || location.includes('Barcelona') || 
               location.includes('Madrid')) {
      return { location, country: 'Spain' }
    } else if (location.includes('Germany') || location.includes('Berlin')) {
      return { location, country: 'Germany' }
    } else if (location.includes('Switzerland') || location.includes('Lausanne')) {
      return { location, country: 'Switzerland' }
    } else if (location.includes('China') || location.includes('Shanghai')) {
      return { location, country: 'China' }
    } else if (location.includes('India') || location.includes('Hyderabad') || 
               location.includes('Mohali')) {
      return { location, country: 'India' }
    } else if (location.includes('Canada') || location.includes('Toronto')) {
      return { location, country: 'Canada' }
    } else if (location.includes('Italy') || location.includes('Milan')) {
      return { location, country: 'Italy' }
    } else if (location.includes('Singapore')) {
      return { location, country: 'Singapore' }
    }
  }
  
  return { location: 'Unknown', country: 'Unknown' }
}

async function importMBAData() {
  try {
    console.log('Reading CSV file...')
    const csvContent = readFileSync('data  - MBA school data format.csv', 'utf-8')
    
    console.log('Parsing CSV...')
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
    
    console.log(`Found ${records.length} MBA schools in CSV`)
    
    // Check which schools already exist
    console.log('Checking existing schools...')
    const { data: existingSchools, error: checkError } = await supabase
      .from('mba_schools')
      .select('name')
    
    if (checkError) {
      console.error('Error checking existing schools:', checkError)
      return
    }
    
    const existingNames = new Set(existingSchools?.map(school => school.name.toLowerCase()) || [])
    console.log(`Found ${existingNames.size} existing schools`)
    
    // Process each record
    const processedRecords = records.map((record: any, index: number) => {
      const { location, country } = extractLocation(record.Description || '')
      
      return {
        name: record['School Name']?.trim() || `School ${index + 1}`,
        description: record.Description?.trim() || null,
        location: record.Location?.trim() || location,
        country: record.Location?.includes('USA') ? 'USA' : 
                record.Location?.includes('UK') ? 'UK' :
                record.Location?.includes('Canada') ? 'Canada' :
                record.Location?.includes('France') ? 'France' :
                record.Location?.includes('Spain') ? 'Spain' :
                record.Location?.includes('Germany') ? 'Germany' :
                record.Location?.includes('China') ? 'China' :
                record.Location?.includes('India') ? 'India' :
                record.Location?.includes('Switzerland') ? 'Switzerland' :
                record.Location?.includes('Italy') ? 'Italy' :
                record.Location?.includes('Singapore') ? 'Singapore' :
                country,
        type: 'Full-time MBA',
        
        // New fields from CSV
        class_size: parseNumber(record['Class Size']?.replace(/[~()]/g, '')?.split(',')[0]),
        women_percentage: parseNumber(record.Women?.replace('%', '')),
        mean_gmat: parseNumber(record['Mean GMAT']),
        mean_gpa: parseNumber(record['Mean GPA']),
        avg_gre: parseNumber(record['Avg GRE']),
        avg_work_exp_years: parseNumber(record['Avg Work Exp (Years)']),
        avg_starting_salary: parseSalary(record['Avg Starting Salary']),
        tuition: parseSalary(record['Tuition (Total)']),
        application_deadlines: record['Application Deadlines']?.trim() || null,
        application_fee: parseSalary(record['Application Fee']),
        gmat_gre_waiver_available: record['GMAT/GRE Waiver Available']?.toLowerCase() === 'yes',
        class_profile: record['Class Profile']?.trim() || null,
        admissions_rounds: record['Admissions Rounds']?.toString()?.trim() || null,
        qs_mba_rank: parseNumber(record['QS MBA Rank']),
        ft_global_mba_rank: parseNumber(record['FT Global MBA Rank']),
        bloomberg_mba_rank: parseNumber(record['Bloomberg MBA Rank']),
        employment_in_3_months_percent: parseNumber(record['Employment in 3 Months (%)']?.replace('%', '')),
        weighted_salary: parseSalary(record['Weighted Salary ($)']),
        top_hiring_companies: record['Top Hiring Companies']?.trim() || null,
        alumni_network_strength: record['Alumni Network Strength']?.trim() || null,
        notable_alumni: record['Notable Alumni']?.trim() || null,
        
        // Set defaults for other required fields
        ranking: parseNumber(record['QS MBA Rank']) || parseNumber(record['FT Global MBA Rank']) || null,
        duration: '2 years',
        status: 'active'
      }
    }).filter(record => {
      // Only include schools that don't already exist
      const isNew = !existingNames.has(record.name.toLowerCase())
      if (!isNew) {
        console.log(`Skipping existing school: ${record.name}`)
      }
      return isNew
    })
    
    console.log(`Processed ${processedRecords.length} new schools for import`)
    
    if (processedRecords.length === 0) {
      console.log('No new schools to import!')
      return
    }
    
    console.log('Sample processed record:', JSON.stringify(processedRecords[0], null, 2))
    
    console.log('Inserting records into Supabase...')
    
    // Insert in batches of 5 to avoid timeout
    const batchSize = 5
    let totalInserted = 0
    
    for (let i = 0; i < processedRecords.length; i += batchSize) {
      const batch = processedRecords.slice(i, i + batchSize)
      
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(processedRecords.length / batchSize)}...`)
      
      const { data, error } = await supabase
        .from('mba_schools')
        .insert(batch)
        .select()
      
      if (error) {
        console.error('Error inserting batch:', error)
        console.error('Failed batch data:', JSON.stringify(batch.map(b => b.name), null, 2))
        
        // Try inserting one by one to identify problematic records
        for (const record of batch) {
          const { error: singleError } = await supabase
            .from('mba_schools')
            .insert([record])
          
          if (singleError) {
            console.error(`Failed to insert ${record.name}:`, singleError)
          } else {
            totalInserted++
            console.log(`✅ Successfully inserted: ${record.name}`)
          }
        }
      } else {
        totalInserted += batch.length
        console.log(`✅ Successfully inserted batch of ${batch.length} schools`)
      }
    }
    
    console.log(`✅ Successfully imported ${totalInserted} MBA schools!`)
    
    // Verify the import
    const { data: verifyData, error: verifyError } = await supabase
      .from('mba_schools')
      .select('name, class_size, mean_gmat, women_percentage')
      .not('class_size', 'is', null)
      .limit(5)
    
    if (verifyError) {
      console.error('Error verifying import:', verifyError)
    } else {
      console.log('Sample of imported data with new fields:', verifyData)
    }
    
  } catch (error) {
    console.error('Import failed:', error)
  }
}

// Run the import
importMBAData() 