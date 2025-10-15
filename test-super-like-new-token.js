const jwt = require('jsonwebtoken');

// Generate token for user 21 (Andi Hatz from screenshot)
const userId = 21;
const email = `cox1754669946368@carmatch.temp`; // From debug earlier

const token = jwt.sign(
  { userId: userId, email: email },
  'your-secret-key', // Should match backend JWT secret
  { expiresIn: '365d' },
);

console.log(`Token for user ${userId}:`);
console.log(token);

// Test with this token
const axios = require('axios');

async function testWithNewToken() {
  console.log('\n🧪 Testing Super Like with new token...');

  try {
    // Check inventory first
    const inventoryResponse = await axios.get(
      'http://localhost:3000/store/my-inventory/active',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log('📦 Active inventory:', inventoryResponse.data);

    // Try Super Like to user 15 (main account)
    const targetUserId = 15;
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
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
  }
}

setTimeout(testWithNewToken, 1000);
