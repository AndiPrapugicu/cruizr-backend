const jwt = require('jsonwebtoken');
const axios = require('axios');

// Use the same secret as in your .env file
const JWT_SECRET = 'your_jwt_secret_key_2024';

async function testSuperLikeActivation() {
  console.log('🧪 Testing Super Like activation with proper auth...');

  // Generate a fresh token for user 1
  const payload = {
    email: 'andi@andi.com',
    sub: 1,
    name: 'Andi Hatz',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  const token = jwt.sign(payload, JWT_SECRET);
  console.log('🔑 Generated token for user 1');

  try {
    // First check current inventory
    console.log('\n📦 Checking current inventory...');
    const inventoryRes = await axios.get(
      'http://localhost:3001/store/inventory',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('Current inventory:', inventoryRes.data);

    // Now try to activate super-like-5pack
    console.log('\n🔄 Attempting to activate super-like-5pack...');
    const activateRes = await axios.post(
      'http://localhost:3001/store/activate',
      {
        itemId: 'super-like-5pack',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Activation successful:', activateRes.data);

    // Check inventory again
    console.log('\n📦 Checking inventory after activation...');
    const inventoryAfterRes = await axios.get(
      'http://localhost:3001/store/inventory',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('Inventory after activation:', inventoryAfterRes.data);
  } catch (error) {
    console.log('❌ Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}

testSuperLikeActivation();
