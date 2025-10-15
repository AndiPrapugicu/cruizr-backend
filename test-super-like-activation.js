const axios = require('axios');

// Test activation of Super Like
async function testSuperLikeActivation() {
  console.log('🧪 Testing Super Like activation...');

  try {
    // Test activation with valid token for User 1
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZGlAYW5kaS5jb20iLCJzdWIiOjEsIm5hbWUiOiJBbmRpIEhhdHoiLCJpYXQiOjE3NTQ1NTc4NDgsImV4cCI6MTc1NTE2MjY0OH0.YwI3_oXFf-T2NDSm-tCo7lGJT9l6Lxe8eOxpjsI8cW0';

    const activateData = {
      itemId: 'super-like-5pack',
    };

    console.log('📤 Sending activation request:', activateData);

    const response = await axios.post(
      'http://localhost:3000/store/activate',
      activateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Activation successful:', response.data);

    // Now test Super Like usage
    console.log('\n🌟 Testing Super Like usage...');

    const superLikeData = {
      targetUserId: 15,
    };

    const superLikeResponse = await axios.post(
      'http://localhost:3000/store/actions/super-like',
      superLikeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Super Like sent successfully:', superLikeResponse.data);
  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}

testSuperLikeActivation();
