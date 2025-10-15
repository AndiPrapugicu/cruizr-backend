const axios = require('axios');

async function testBadgeAPI() {
  try {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInN1YiI6OSwibmFtZSI6IlRlc3REb2kiLCJpYXQiOjE3NTQyMDY5NjMsImV4cCI6MTc1NDgxMTc2M30.VgxQssthia75rs62QeUKPEXX5rwODTN0QqgJe_1CQw8';

    console.log('🔧 Testing badge API with categories...');

    // Test getting all badges
    console.log('\n📋 Getting all badges:');
    const response1 = await axios.get('http://localhost:3000/badges', {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('All badges sample (first 3):');
    response1.data.slice(0, 3).forEach((badge) => {
      console.log(`  - ${badge.name} (category: ${badge.category || 'none'})`);
    });

    // Test getting user badges
    console.log('\n🏆 Getting user badges:');
    const response2 = await axios.get(
      'http://localhost:3000/badges/my-badges',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log('User badges:');
    response2.data.forEach((badge) => {
      console.log(`  - ${badge.name} (category: ${badge.category || 'none'})`);
    });

    // Test getting categories
    console.log('\n📂 Getting badge categories:');
    const response3 = await axios.get(
      'http://localhost:3000/badges/categories',
      {
        headers: { Authorization: `Bearer ${token}` },
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
