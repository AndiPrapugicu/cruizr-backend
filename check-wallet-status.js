const axios = require('axios');

async function checkWallet() {
  try {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidGVzdDQ1NkBleGFtcGxlLmNvbSIsInN1YiI6NiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc1NDIwOTk2MSwiZXhwIjoxNzU0ODE0NzYxfQ.hVhJmMCOPNciwhI0o2_n4UslGxhvqpaCnH8s3RQu2Gg';

    console.log('Checking user wallet...');

    const response = await axios.get('http://localhost:3000/fuel/wallet', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Wallet data:');
    console.log('Fuel Balance:', response.data.fuelBalance);
    console.log('Premium Credits:', response.data.premiumCredits);
    console.log('Streak Days:', response.data.streakDays);
    console.log('Last Login:', response.data.lastLoginDate);
    console.log('Full data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get wallet:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkWallet();
