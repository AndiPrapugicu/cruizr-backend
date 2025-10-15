const axios = require('axios');

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInN1YiI6OSwibmFtZSI6IlRlc3REb2kiLCJpYXQiOjE3NTQyMTI4MDksImV4cCI6MTc1NDgxNzYwOX0.nmyhWsJY_SgNaMeMg_iEeQYPBEm_NJP7J9fLgvucT6U';

async function testEndpoints() {
  console.log('Testing all problematic endpoints...\n');

  const endpoints = [
    {
      method: 'GET',
      url: 'http://localhost:3000/fuel/wallet',
      name: 'Fuel Wallet',
    },
    {
      method: 'POST',
      url: 'http://localhost:3000/fuel/daily-login',
      name: 'Daily Login',
    },
    {
      method: 'GET',
      url: 'http://localhost:3000/polls/match/1',
      name: 'Polls Match',
    },
    {
      method: 'GET',
      url: 'http://localhost:3000/polls/results/1',
      name: 'Polls Results',
    },
    {
      method: 'GET',
      url: 'http://localhost:3000/users/me',
      name: 'User Profile',
    },
    { method: 'GET', url: 'http://localhost:3000/cars', name: 'Cars List' },
    {
      method: 'GET',
      url: 'http://localhost:3000/badges/my-badges',
      name: 'My Badges',
    },
    {
      method: 'GET',
      url: 'http://localhost:3000/users/me/stats',
      name: 'User Stats',
    },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`✅ ${endpoint.name}: Status ${response.status}`);

      // Show some response data if it's small enough
      if (response.data && JSON.stringify(response.data).length < 200) {
        console.log(`   Response:`, response.data);
      }
    } catch (error) {
      console.log(
        `❌ ${endpoint.name}: ${error.response?.status || 'ERROR'} - ${error.response?.statusText || error.message}`,
      );
      if (error.response?.data) {
        console.log(`   Error details:`, error.response.data);
      }
      if (error.code) {
        console.log(`   Error code:`, error.code);
      }
      if (error.address && error.port) {
        console.log(`   Connection:`, error.address + ':' + error.port);
      }
    }
    console.log(''); // Empty line for separation
  }
}

testEndpoints().catch(console.error);
