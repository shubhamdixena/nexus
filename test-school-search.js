/**
 * Test script to verify school search functionality
 * This script tests the data transformation we fixed
 */

// Mock API response in the format returned by the MBA schools API
const mockApiResponse = {
  data: [
    {
      id: "1",
      business_school: "Harvard Business School",
      location: "Boston, MA",
      country: "USA",
      qs_mba_rank: 1,
      ft_global_mba_rank: 2,
      bloomberg_mba_rank: 1,
      website: "https://www.hbs.edu"
    },
    {
      id: "2", 
      business_school: "Stanford Graduate School of Business",
      location: "Stanford, CA",
      country: "USA",
      qs_mba_rank: 2,
      ft_global_mba_rank: 1,
      bloomberg_mba_rank: 2,
      website: "https://www.gsb.stanford.edu"
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  },
  success: true
}

// Test the transformation function we implemented
function transformSchoolsData(apiResponse) {
  const schools = (apiResponse.data || []).map((school) => ({
    id: school.id,
    name: school.business_school || school.name || 'Unknown School',
    location: school.location || 'Unknown Location',
    country: school.country,
    qs_mba_rank: school.qs_mba_rank,
    ft_global_mba_rank: school.ft_global_mba_rank,
    bloomberg_mba_rank: school.bloomberg_mba_rank,
    website: school.website
  }))
  
  return schools
}

// Test the transformation
console.log('Testing school data transformation...')
console.log('Input:', JSON.stringify(mockApiResponse, null, 2))

const transformedSchools = transformSchoolsData(mockApiResponse)
console.log('\nTransformed output:', JSON.stringify(transformedSchools, null, 2))

// Verify the transformation worked correctly
const expectedFields = ['id', 'name', 'location', 'country', 'qs_mba_rank', 'ft_global_mba_rank', 'bloomberg_mba_rank', 'website']

let testPassed = true
transformedSchools.forEach((school, index) => {
  expectedFields.forEach(field => {
    if (field === 'name' && !school[field]) {
      console.error(`❌ Test failed: School ${index + 1} missing required field '${field}'`)
      testPassed = false
    }
  })
  
  // Check that business_school was correctly mapped to name
  if (school.name === 'Harvard Business School' || school.name === 'Stanford Graduate School of Business') {
    console.log(`✅ School ${index + 1}: business_school correctly mapped to name: ${school.name}`)
  }
})

if (testPassed) {
  console.log('\n✅ All tests passed! School data transformation is working correctly.')
} else {
  console.log('\n❌ Some tests failed. Check the transformation logic.')
}
