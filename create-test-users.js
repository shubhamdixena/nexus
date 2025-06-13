// Simple script to create test users
// Run this in your browser console on localhost:3001

async function createTestUsers() {
  const users = [
    { email: 'admin@test.com', password: 'admin123' },
    { email: 'user@test.com', password: 'user123' },
    { email: 'student@test.com', password: 'student123' }
  ];

  for (const user of users) {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });
      
      const result = await response.json();
      console.log(`Created user ${user.email}:`, result);
    } catch (error) {
      console.error(`Failed to create ${user.email}:`, error);
    }
  }
}

// Run the function
createTestUsers();