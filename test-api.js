const axios = require('axios');

async function testBadgeAPI() {
  try {
    console.log('🔧 Testing badge API with categories...');

    // Test getting all badges
    console.log('\n📋 Getting all badges:');
    const response1 = await axios.get('http://localhost:3000/badges', {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGV4YW1wbGUuY29tIiwidXNlcklkIjoxLCJpYXQiOjE3MjI2MzMxMDIsImV4cCI6MTcyMjcxOTUwMn0.I8eNkUOVjftGIjqPwctjg4YSQi1o8mhzn5qkGW1vJgo',
      },
    });

    console.log('All badges sample (first 3):');
    response1.data.slice(0, 3).forEach((badge) => {
      console.log(`  - ${badge.name} (${badge.category})`);
    });

    // Test getting user badges
    console.log('\n🏆 Getting user badges:');
    const response2 = await axios.get(
      'http://localhost:3000/badges/my-badges',
      {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGV4YW1wbGUuY29tIiwidXNlcklkIjoxLCJpYXQiOjE3MjI2MzMxMDIsImV4cCI6MTcyMjcxOTUwMn0.I8eNkUOVjftGIjqPwctjg4YSQi1o8mhzn5qkGW1vJgo',
        },
      },
    );

    console.log('User badges:');
    response2.data.forEach((badge) => {
      console.log(`  - ${badge.name} (${badge.category})`);
    });

    // Test getting categories
    console.log('\n📂 Getting badge categories:');
    const response3 = await axios.get(
      'http://localhost:3000/badges/categories',
      {
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGV4YW1wbGUuY29tIiwidXNlcklkIjoxLCJpYXQiOjE3MjI2MzMxMDIsImV4cCI6MTcyMjcxOTUwMn0.I8eNkUOVjftGIjqPwctjg4YSQi1o8mhzn5qkGW1vJgo',
        },
      },
    );

    console.log('Categories:');
    response3.data.forEach((category) => {
      console.log(`  - ${category.name} (${category.id})`);
    });

    console.log('\n✅ API tests completed successfully!');
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testBadgeAPI();
