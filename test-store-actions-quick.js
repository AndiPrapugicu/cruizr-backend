const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';

// Use a valid token for testing - update this with your current token
const TEST_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidGVzdDQ1NkBleGFtcGxlLmNvbSIsInN1YiI6NiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc1NDIxMzc4MSwiZXhwIjoxNzU0ODE4NTgxfQ.GHiDaiQaltM6I_Ch390D_hzoAcgN9ILRh0pH_KS2s-0';

// Target user for testing Super Like and See Who Liked
const TARGET_USER_ID = 1;

// Axios instance with default headers
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Test each endpoint one by one
async function testSuperLikeEndpoint() {
  console.log('\n🌟 TESTING SUPER LIKE ENDPOINT');
  console.log('='.repeat(40));

  try {
    const response = await api.post('/store/actions/super-like', {
      targetUserId: TARGET_USER_ID,
    });

    console.log('✅ Super Like SUCCESS:', response.status);
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Super Like FAILED:', error.response?.status || 'Unknown');
    console.log(
      '📋 Error:',
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
    return false;
  }
}

async function testProfileBoostEndpoint() {
  console.log('\n🚀 TESTING PROFILE BOOST ENDPOINT');
  console.log('='.repeat(40));

  try {
    const response = await api.post('/store/actions/profile-boost', {
      boostType: 'boost-3h',
    });

    console.log('✅ Profile Boost SUCCESS:', response.status);
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(
      '❌ Profile Boost FAILED:',
      error.response?.status || 'Unknown',
    );
    console.log(
      '📋 Error:',
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
    return false;
  }
}

async function testSeeWhoLikedEndpoint() {
  console.log('\n👀 TESTING SEE WHO LIKED ENDPOINT');
  console.log('='.repeat(40));

  try {
    const response = await api.post('/store/actions/reveal-likes', {});

    console.log('✅ See Who Liked SUCCESS:', response.status);
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(
      '❌ See Who Liked FAILED:',
      error.response?.status || 'Unknown',
    );
    console.log(
      '📋 Error:',
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
    return false;
  }
}

async function testSwipeRewindEndpoint() {
  console.log('\n⏪ TESTING SWIPE REWIND ENDPOINT');
  console.log('='.repeat(40));

  try {
    const response = await api.post('/store/actions/swipe-rewind', {});

    console.log('✅ Swipe Rewind SUCCESS:', response.status);
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Swipe Rewind FAILED:', error.response?.status || 'Unknown');
    console.log(
      '📋 Error:',
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
    return false;
  }
}

async function testInventoryEndpoint() {
  console.log('\n📦 TESTING INVENTORY ENDPOINT');
  console.log('='.repeat(40));

  try {
    const response = await api.get('/store/inventory');

    console.log('✅ Inventory SUCCESS:', response.status);
    console.log(`📋 Found ${response.data.length} items in inventory`);

    // Show relevant items
    const relevantItems = response.data.filter(
      (item) =>
        ['super_like', 'boost', 'rewind'].includes(item.storeItem?.type) ||
        item.storeItem?.name?.toLowerCase().includes('see who liked'),
    );

    console.log('\n🔍 Relevant items for testing:');
    relevantItems.forEach((item) => {
      console.log(`  - ${item.storeItem.name} (${item.storeItem.type})`);
      console.log(`    Uses remaining: ${item.usesRemaining || 'N/A'}`);
      console.log(`    Active: ${item.isActive}`);
    });

    return true;
  } catch (error) {
    console.log('❌ Inventory FAILED:', error.response?.status || 'Unknown');
    console.log(
      '📋 Error:',
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
    return false;
  }
}

async function testStoreItemsEndpoint() {
  console.log('\n🛍️ TESTING STORE ITEMS ENDPOINT');
  console.log('='.repeat(40));

  try {
    const response = await api.get('/store/items');

    console.log('✅ Store Items SUCCESS:', response.status);
    console.log(`📋 Found ${response.data.length} items in store`);

    // Show relevant items
    const relevantItems = response.data.filter(
      (item) =>
        ['super_like', 'boost', 'rewind'].includes(item.type) ||
        item.name?.toLowerCase().includes('see who liked'),
    );

    console.log('\n🔍 Relevant store items:');
    relevantItems.forEach((item) => {
      console.log(`  - ${item.name} (${item.type})`);
      console.log(`    Price: ${item.price} ${item.currency}`);
      console.log(`    ID: ${item.id}`);
    });

    return true;
  } catch (error) {
    console.log('❌ Store Items FAILED:', error.response?.status || 'Unknown');
    console.log(
      '📋 Error:',
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
    return false;
  }
}

// Main test runner
async function runQuickTests() {
  console.log('🚀 QUICK STORE ACTIONS TEST');
  console.log('Testing core endpoints for store actions\n');

  const results = [];

  // Test order: info first, then actions
  const tests = [
    { name: 'Store Items', fn: testStoreItemsEndpoint },
    { name: 'Inventory', fn: testInventoryEndpoint },
    { name: 'Super Like', fn: testSuperLikeEndpoint },
    { name: 'Profile Boost', fn: testProfileBoostEndpoint },
    { name: 'See Who Liked', fn: testSeeWhoLikedEndpoint },
    { name: 'Swipe Rewind', fn: testSwipeRewindEndpoint },
  ];

  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`💥 ${test.name} crashed:`, error.message);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\n🏁 TEST SUMMARY');
  console.log('='.repeat(40));

  const passed = results.filter((r) => r.success).length;
  const failed = results.length - passed;

  console.log(
    `Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`,
  );
  console.log(
    `Success rate: ${((passed / results.length) * 100).toFixed(1)}%\n`,
  );

  results.forEach((result) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n✨ Testing completed!');
}

// Run the tests
runQuickTests().catch((error) => {
  console.log('\n💥 Fatal error:', error.message);
  console.error(error);
});
