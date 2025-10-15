const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidGVzdDQ1NkBleGFtcGxlLmNvbSIsInN1YiI6NiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc1NDIxMzc4MSwiZXhwIjoxNzU0ODE4NTgxfQ.GHiDaiQaltM6I_Ch390D_hzoAcgN9ILRh0pH_KS2s-0';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

async function quickEndpointTest() {
  console.log('🚀 QUICK ENDPOINT VALIDATION');
  console.log('Testing store action URLs are correct\n');

  const tests = [
    {
      name: 'Super Like',
      url: '/store/actions/super-like',
      method: 'POST',
      data: { targetUserId: 1 },
    },
    {
      name: 'Profile Boost (FIXED URL)',
      url: '/store/actions/profile-boost/boost-3h',
      method: 'POST',
      data: {},
    },
    {
      name: 'See Who Liked',
      url: '/store/actions/reveal-likes',
      method: 'POST',
      data: {},
    },
    {
      name: 'Swipe Rewind',
      url: '/store/actions/swipe-rewind',
      method: 'POST',
      data: {},
    },
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await api[test.method.toLowerCase()](
        test.url,
        test.data,
      );
      console.log(`✅ ${test.name}: SUCCESS (${response.status})`);
      if (response.data.message)
        console.log(`   Message: ${response.data.message}`);
    } catch (error) {
      const status = error.response?.status || 'Unknown';
      const message = error.response?.data?.message || error.message;

      if (status === 404) {
        console.log(`❌ ${test.name}: ENDPOINT NOT FOUND (${status})`);
      } else if (status === 400 && message.includes('Nu ai')) {
        console.log(`✅ ${test.name}: ENDPOINT OK (${status}) - "${message}"`);
      } else {
        console.log(`❌ ${test.name}: ERROR (${status}) - ${message}`);
      }
    }
    console.log('');
  }

  console.log('🏁 ENDPOINT VALIDATION COMPLETE!');
}

quickEndpointTest().catch(console.error);
