const axios = require('axios');

async function testStoreEndpoints() {
  try {
    // Use a fresh token for user 6 - UPDATED
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidGVzdDQ1NkBleGFtcGxlLmNvbSIsInN1YiI6NiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc1NDIxMzc4MSwiZXhwIjoxNzU0ODE4NTgxfQ.GHiDaiQaltM6I_Ch390D_hzoAcgN9ILRh0pH_KS2s-0';

    const baseURL = 'http://localhost:3000';
    console.log('🛍️ Testing Store endpoints...\n');

    const storeEndpoints = [
      { name: 'Store Items', url: '/store/items' },
      { name: 'Store Structured', url: '/store/structured' },
      { name: 'User Inventory', url: '/store/inventory' },
      { name: 'My Active Inventory', url: '/store/my-inventory/active' },
      { name: 'Store Fuel Wallet', url: '/fuel/wallet' },
    ];

    for (const endpoint of storeEndpoints) {
      try {
        console.log(`Testing ${endpoint.name}...`);

        const response = await axios.get(`${baseURL}${endpoint.url}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`✅ ${endpoint.name}: Status ${response.status}`);
        if (endpoint.name === 'Store Items' && response.data.length) {
          console.log(`   Found ${response.data.length} items`);
        }
        if (endpoint.name === 'Store Fuel Wallet') {
          console.log(`   Wallet balance: ${response.data.balance} fuel`);
        }
        console.log('');
      } catch (error) {
        console.error(
          `❌ ${endpoint.name}: ${error.response?.status} - ${error.response?.statusText}`,
        );
        if (error.response?.data) {
          console.error(`   Error details:`, error.response.data);
        }
        console.error(`   Error code: ${error.code}`);
        console.log('');
      }
    }

    console.log('🏁 Store endpoints testing completed!');
  } catch (error) {
    console.error('💥 Fatal error during testing:', error.message);
  }
}

testStoreEndpoints();
