const axios = require('axios');

async function testWallet() {
  try {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZGlAYW5kaS5jb20iLCJzdWIiOjEsInVzZXJJZCI6MSwibmFtZSI6IkFuZGkgSGF0eiIsImlhdCI6MTc1NDQ3NzkyMiwiZXhwIjoxNzU1MDgyNzIyfQ.8dC2dWsElLe65Jul_fUDew797D1QNjDkD1rK_pAWHsg';

    console.log('Testing wallet endpoint for User ID 1...');

    const response = await axios.get('http://localhost:3000/fuel/wallet', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Wallet data for User ID 1:');
    console.log('Fuel Balance:', response.data.balance);
    console.log('Premium Balance:', response.data.premiumBalance);
    console.log('Premium Points:', response.data.premiumPoints);
    console.log('Streak Days:', response.data.streakDays);
    console.log('Full data:', JSON.stringify(response.data, null, 2));

    // Test store items
    console.log('\n🛒 Testing store items...');
    const storeResponse = await axios.get('http://localhost:3000/store/items', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Store items count:', storeResponse.data.length);
    console.log(
      'First 3 items:',
      storeResponse.data.slice(0, 3).map((item) => ({
        id: item.id,
        name: item.name,
        currency: item.currency,
        price: item.price,
        category: item.category,
      })),
    );
  } catch (error) {
    console.error('❌ Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testWallet();
