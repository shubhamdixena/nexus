#!/usr/bin/env node

/**
 * Fix Deadline School Names Script
 * 
 * This script fixes deadline entries that have random UUIDs instead of proper school names.
 * It replaces "School {uuid}" titles with the actual business school names from the mba_schools table.
 * 
 * Usage: node scripts/fix-deadline-school-names.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Using service role key for admin operations
)

async function fixDeadlineSchoolNames() {
  console.log('🔧 Starting deadline school name fix...')
  
  try {
    // 1. Find all deadlines with "School UUID" pattern
    const { data: badDeadlines, error: fetchError } = await supabase
      .from('deadlines')
      .select('id, title, source_id, source_type')
      .eq('source_type', 'school_bookmark')
      .ilike('title', 'School %-%-%-%-%')
    
    if (fetchError) {
      throw new Error(`Failed to fetch bad deadlines: ${fetchError.message}`)
    }
    
    if (!badDeadlines || badDeadlines.length === 0) {
      console.log('✅ No deadline entries found with UUID school names.')
      return
    }
    
    console.log(`📋 Found ${badDeadlines.length} deadline entries with UUID school names`)
    
    // 2. Get all school information for mapping
    const schoolIds = [...new Set(badDeadlines.map(d => d.source_id))]
    const { data: schools, error: schoolError } = await supabase
      .from('mba_schools')
      .select('id, business_school')
      .in('id', schoolIds)
    
    if (schoolError) {
      throw new Error(`Failed to fetch school data: ${schoolError.message}`)
    }
    
    // 3. Create mapping from school ID to business school name
    const schoolMap = {}
    schools.forEach(school => {
      schoolMap[school.id] = school.business_school
    })
    
    // 4. Process each bad deadline
    let fixedCount = 0
    let skippedCount = 0
    
    for (const deadline of badDeadlines) {
      const schoolName = schoolMap[deadline.source_id]
      
      if (!schoolName) {
        console.log(`⚠️  Skipping deadline ${deadline.id}: No school found for ID ${deadline.source_id}`)
        skippedCount++
        continue
      }
      
      // Replace "School {uuid}" with actual school name
      const newTitle = deadline.title.replace(
        /School [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
        schoolName
      )
      
      if (newTitle === deadline.title) {
        console.log(`⚠️  Skipping deadline ${deadline.id}: Title doesn't match UUID pattern`)
        skippedCount++
        continue
      }
      
      // Update the deadline title
      const { error: updateError } = await supabase
        .from('deadlines')
        .update({ title: newTitle })
        .eq('id', deadline.id)
      
      if (updateError) {
        console.log(`❌ Failed to update deadline ${deadline.id}: ${updateError.message}`)
        continue
      }
      
      console.log(`✅ Fixed: "${deadline.title}" → "${newTitle}"`)
      fixedCount++
    }
    
    console.log('\n📊 Summary:')
    console.log(`   ✅ Fixed: ${fixedCount} deadlines`)
    console.log(`   ⚠️  Skipped: ${skippedCount} deadlines`)
    console.log(`   📋 Total processed: ${badDeadlines.length} deadlines`)
    
    if (fixedCount > 0) {
      console.log('\n🎉 Successfully fixed deadline school names!')
    }
    
  } catch (error) {
    console.error('❌ Error fixing deadline school names:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  fixDeadlineSchoolNames()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}

module.exports = { fixDeadlineSchoolNames } 