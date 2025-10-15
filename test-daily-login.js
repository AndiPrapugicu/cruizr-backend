const axios = require('axios');

async function testDailyLogin() {
  try {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidGVzdDQ1NkBleGFtcGxlLmNvbSIsInN1YiI6NiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc1NDIwOTk2MSwiZXhwIjoxNzU0ODE0NzYxfQ.hVhJmMCOPNciwhI0o2_n4UslGxhvqpaCnH8s3RQu2Gg';

    console.log('Testing daily login endpoint...');

    const response = await axios.post(
      'http://localhost:3000/fuel/daily-login',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Daily login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Daily login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDailyLogin();
