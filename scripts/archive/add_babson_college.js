/**
 * Script to add Babson College MBA data to the database
 * 
 * Usage:
 * 1. Make sure you're logged in as an admin in the browser
 * 2. Copy your auth token from browser cookies
 * 3. Run: node scripts/add_babson_college.js <auth_token>
 */

const fetch = require('node-fetch');

async function addBabsonCollege(authToken) {
  if (!authToken) {
    console.error('Auth token is required. Please provide it as an argument.');
    console.error('Usage: node scripts/add_babson_college.js <auth_token>');
    process.exit(1);
  }

  const babsonData = {
    name: 'Babson College, F.W. Olin Graduate School of Business',
    business_school: 'F.W. Olin Graduate School of Business',
    location: 'Wellesley, Massachusetts',
    country: 'USA',
    type: 'Full-time MBA',
    status: 'active',
    core_curriculum: '15 credits via nine core courses including Strategy, Business Analytics, Finance, Entrepreneurship, Managing People & Organizations, Financial Reporting.',
    program_duration: 'One-year (12 months) or two-year (21 months) options; Online MBA 3-4 years',
    credits_required: '45 credits',
    key_features: '#1 MBA for Entrepreneurship for 32 consecutive years, Babson Consulting Experience, Real-world learning with 80+ partner organizations'
  };

  try {
    // First check if Babson College already exists
    const checkResponse = await fetch('http://localhost:3000/api/mba-schools?search=Babson', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-access-token=${authToken}`
      }
    });

    const checkData = await checkResponse.json();
    
    if (checkData.data && checkData.data.some(school => 
      school.name.includes('Babson') || 
      (school.business_school && school.business_school.includes('Olin'))
    )) {
      console.log('Babson College already exists in the database. Skipping insertion.');
      return;
    }

    // Add the new school
    const response = await fetch('http://localhost:3000/api/admin/mba-schools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sb-access-token=${authToken}`
      },
      body: JSON.stringify(babsonData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Babson College MBA data added successfully:', result);
    } else {
      console.error('Failed to add Babson College MBA data:', result);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get auth token from command line argument
const authToken = process.argv[2];
addBabsonCollege(authToken); 