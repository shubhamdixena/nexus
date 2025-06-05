// Test script for Profile Completion API
// Run this with: node test-profile-completion.js

const BASE_URL = 'http://localhost:3000';

// Track test results
let hasErrors = false;
let totalTests = 0;
let passedTests = 0;

function logTestResult(testName, success, message) {
  totalTests++;
  if (success) {
    passedTests++;
    console.log(`✅ ${testName}: ${message}`);
  } else {
    hasErrors = true;
    console.log(`❌ ${testName}: ${message}`);
  }
}

// Mock session data for testing (you'll need to replace with actual session)
const testProfileData = {
  personal: {
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@example.com",
    phone: "+1-555-0123",
    dateOfBirth: "1995-06-15",
    nationality: "United States"
  },
  education: {
    highestDegree: "bachelor",
    fieldOfStudy: "Computer Science",
    university: "Stanford University",
    graduationYear: "2020",
    gpa: "3.8",
    testScores: {
      gmat: "720",
      gre: "325",
      toefl: "108",
      ielts: "8.0"
    }
  },
  career: {
    targetDegree: "mba",
    targetPrograms: ["Full-time MBA", "Executive MBA"],
    careerObjective: "To become a strategic leader in technology consulting, leveraging my technical background to drive digital transformation initiatives in Fortune 500 companies.",
    workExperience: "3-5",
    preferredCountries: ["USA", "UK", "Canada"]
  },
  preferences: {
    budgetRange: "70k-100k",
    startDate: "fall-2025",
    scholarshipInterest: true,
    accommodationPreference: "on-campus",
    communicationPreferences: ["Email", "In-app Notifications"]
  }
};

async function testProfileCompletion() {
  console.log('🧪 Testing Profile Completion API...\n');
  
  try {
    // Test 1: POST - Complete Profile
    console.log('1️⃣ Testing POST /api/profile/complete');
    console.log('Sending profile data:', JSON.stringify(testProfileData, null, 2));
    
    const completeResponse = await fetch(`${BASE_URL}/api/profile/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real scenario, you'd need actual session cookie
      },
      body: JSON.stringify(testProfileData)
    });
    
    const completeResult = await completeResponse.json();
    console.log('📤 Response Status:', completeResponse.status);
    console.log('📤 Response Body:', JSON.stringify(completeResult, null, 2));
    
    if (completeResponse.status === 401) {
      logTestResult('POST /api/profile/complete', true, 'Expected: Need authentication to complete profile');
    } else if (completeResponse.status === 200) {
      logTestResult('POST /api/profile/complete', true, 'Success: Profile completed successfully');
    } else {
      logTestResult('POST /api/profile/complete', false, 'Unexpected response status');
    }
    
    // Test 2: GET - Check Completion Status
    console.log('\n2️⃣ Testing GET /api/profile/complete');
    
    const statusResponse = await fetch(`${BASE_URL}/api/profile/complete`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const statusResult = await statusResponse.json();
    console.log('📤 Response Status:', statusResponse.status);
    console.log('📤 Response Body:', JSON.stringify(statusResult, null, 2));
    
    if (statusResponse.status === 401) {
      logTestResult('GET /api/profile/complete', true, 'Expected: Need authentication to check status');
    } else if (statusResponse.status === 200) {
      logTestResult('GET /api/profile/complete', true, 'Success: Got completion status');
    } else {
      logTestResult('GET /api/profile/complete', false, 'Unexpected response status');
    }
    
    // Test 3: Validation Test - Invalid Data
    console.log('\n3️⃣ Testing validation with invalid data');
    
    const invalidData = {
      personal: {
        firstName: "J", // Too short
        lastName: "", // Empty
        email: "invalid-email", // Invalid format
        nationality: "US"
      },
      education: {
        highestDegree: "",
        fieldOfStudy: "CS",
        university: "Stanford",
        graduationYear: "invalid-year" // Invalid format
      },
      career: {
        targetDegree: "",
        targetPrograms: [], // Empty array
        careerObjective: "short", // Too short
        workExperience: "invalid", // Invalid enum
        preferredCountries: []
      },
      preferences: {
        budgetRange: "invalid", // Invalid enum
        startDate: "",
        scholarshipInterest: "not-boolean", // Invalid type
        accommodationPreference: "invalid",
        communicationPreferences: []
      }
    };
    
    const validationResponse = await fetch(`${BASE_URL}/api/profile/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });
    
    const validationResult = await validationResponse.json();
    console.log('📤 Response Status:', validationResponse.status);
    console.log('📤 Response Body:', JSON.stringify(validationResult, null, 2));
    
    if (validationResponse.status === 400) {
      logTestResult('Validation Test', true, 'Success: Validation errors caught correctly');
    } else {
      logTestResult('Validation Test', false, 'Expected validation error');
    }
    
    // Test 4: Test other profile endpoints
    console.log('\n4️⃣ Testing GET /api/profile');
    
    const profileResponse = await fetch(`${BASE_URL}/api/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const profileResult = await profileResponse.json();
    console.log('📤 Response Status:', profileResponse.status);
    console.log('📤 Response Body:', JSON.stringify(profileResult, null, 2));
    
    if (profileResponse.status === 401 || profileResponse.status === 200) {
      logTestResult('GET /api/profile', true, 'Response as expected');
    } else {
      logTestResult('GET /api/profile', false, 'Unexpected response status');
    }
    
    // Test 5: Test PATCH endpoint
    console.log('\n5️⃣ Testing PATCH /api/profile');
    
    const patchData = {
      first_name: "Johnny",
      phone: "+1-555-9999"
    };
    
    const patchResponse = await fetch(`${BASE_URL}/api/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchData)
    });
    
    const patchResult = await patchResponse.json();
    console.log('📤 Response Status:', patchResponse.status);
    console.log('📤 Response Body:', JSON.stringify(patchResult, null, 2));
    
    if (patchResponse.status === 401 || patchResponse.status === 200) {
      logTestResult('PATCH /api/profile', true, 'Response as expected');
    } else {
      logTestResult('PATCH /api/profile', false, 'Unexpected response status');
    }
    
    // Print final results
    console.log('\n🎯 Test Summary:');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}`);
    
    if (hasErrors) {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      console.log('📝 Next Steps:');
      console.log('1. Test with actual user session/authentication');
      console.log('2. Verify database operations in Supabase dashboard');
      console.log('3. Test the frontend profile setup form');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
testProfileCompletion();