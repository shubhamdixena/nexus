// Simple test script to check progress creation
const fetch = require('node-fetch');

async function testProgressCreation() {
  try {
    console.log('Testing application progress creation...');
    
    // Test with a sample school ID that should exist
    const testData = {
      mba_school_id: '550e8400-e29b-41d4-a716-446655440000', // Sample UUID
      application_status: 'not_started',
      notes: 'Test application'
    };
    
    console.log('Request payload:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/application-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail with auth error since we don't have a valid session
        // But it will help us see if the endpoint is working
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testProgressCreation();
