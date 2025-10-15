const axios = require('axios');

// Test Super Like functionality
async function testSuperLike() {
  console.log('🧪 Testing Super Like functionality...');

  try {
    // First, let's check what tokens we have and test with them
    const userTokens = [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE1LCJlbWFpbCI6ImFuZGk0MjI1MkBnbWFpbC5jb20iLCJpYXQiOjE3MjMxMzM4ODAsImV4cCI6MTc1NDY2OTg4MH0.2L0k-zWE1MtJWd4hJxOJRcUEXGnPb-4bJkl_3kztGzE', // User 15
    ];

    const targetUserId = 21; // Andi Hatz from screenshots

    for (const token of userTokens) {
      console.log(
        `\n🌟 Testing Super Like with token: ${token.substring(0, 20)}...`,
      );

      // Check user inventory first
      try {
        const inventoryResponse = await axios.get(
          'http://localhost:3000/store/my-inventory/active',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log('📦 User inventory:', inventoryResponse.data);
      } catch (err) {
        console.log(
          '❌ Error checking inventory:',
          err.response?.data || err.message,
        );
      }

      // Try Super Like
      try {
        const response = await axios.post(
          'http://localhost:3000/store/actions/super-like',
          {
            targetUserId: targetUserId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log('✅ Super Like success:', response.data);
      } catch (err) {
        console.log('❌ Super Like error:', err.response?.data || err.message);
        console.log('Status:', err.response?.status);
      }
    }
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

testSuperLike();
