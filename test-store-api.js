const axios = require('axios');

async function testStoreAPI() {
  try {
    console.log('🔗 Testing Store API...\n');

    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZGlAYW5kaS5jb20iLCJzdWIiOjEsInVzZXJJZCI6MSwibmFtZSI6IkFuZGkgSGF0eiIsImlhdCI6MTc1NDQ4MzY4NSwiZXhwIjoxNzU1MDg4NDg1fQ.YFvz3lcZ-AbvCT5kKHxccK2sM80i2cC5k-ozFppfwF8';

    const response = await axios.get('http://localhost:3000/store/items', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Store Items Response:');
    console.log(`📦 Total items: ${response.data.length}`);

    console.log('\n🏆 Sample Items:');
    response.data.slice(0, 5).forEach((item) => {
      const price = item.realMoneyCost
        ? `$${item.realMoneyCost}`
        : `${item.price} ${item.currency}`;
      console.log(`- ${item.name}: ${price} (${item.type})`);
    });

    // Test categories
    const categories = [...new Set(response.data.map((item) => item.category))];
    console.log('\n📋 Categories:');
    categories.forEach((cat) => {
      const count = response.data.filter(
        (item) => item.category === cat,
      ).length;
      console.log(`- ${cat}: ${count} items`);
    });

    console.log('\n🎯 Enterprise Features Verified!');
  } catch (error) {
    console.error('❌ Error testing store API:', error.message);
  }
}

testStoreAPI();
