const axios = require('axios');

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZGlAYW5kaS5jb20iLCJzdWIiOjEsInVzZXJJZCI6MSwibmFtZSI6IkFuZGkgSGF0eiIsImlhdCI6MTc1NDU2ODQzMiwiZXhwIjoxNzU1MTczMjMyfQ.qx-Bqpp8uh0eQVngAtAw_mObf6mv9ytgzQ22Bk4oyuo';

async function testActiveItems() {
  try {
    console.log('🔍 Testing /store/actions/active-items endpoint...');

    const response = await axios.get(
      'http://localhost:3000/store/actions/active-items',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('📊 Active items response:');
    console.log(JSON.stringify(response.data, null, 2));

    // Also test user inventory
    console.log('\n🎯 Testing user inventory endpoint...');
    const inventoryResponse = await axios.get(
      'http://localhost:3000/store/inventory',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('📦 User inventory:');
    console.log(JSON.stringify(inventoryResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testActiveItems();
