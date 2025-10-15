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

// Color helpers for console output
const colors = {
  success: '\x1b[32m', // Green
  error: '\x1b[31m', // Red
  warning: '\x1b[33m', // Yellow
  info: '\x1b[36m', // Cyan
  reset: '\x1b[0m', // Reset
  bold: '\x1b[1m', // Bold
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test helper functions
async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeRequest(method, endpoint, data = null, description = '') {
  try {
    log(
      `\n${description || `Testing ${method.toUpperCase()} ${endpoint}`}`,
      'info',
    );

    const config = {
      method: method.toLowerCase(),
      url: endpoint,
    };

    if (data) {
      config.data = data;
    }

    const response = await api(config);

    log(`✅ Success: ${response.status} ${response.statusText}`, 'success');

    if (response.data) {
      console.log('📋 Response data:');
      console.log(JSON.stringify(response.data, null, 2));
    }

    return response.data;
  } catch (error) {
    log(
      `❌ Error: ${error.response?.status || 'Unknown'} ${error.response?.statusText || error.message}`,
      'error',
    );

    if (error.response?.data) {
      console.log('📋 Error details:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }

    throw error;
  }
}

// Test functions for each store action
async function testSuperLike() {
  log('\n🌟 ===== TESTING SUPER LIKE =====', 'bold');

  try {
    // First check user inventory for Super Likes
    log('\n1. Checking Super Like inventory...', 'info');
    const inventory = await makeRequest(
      'GET',
      '/store/inventory',
      null,
      'Getting user inventory',
    );

    const superLikeItems = inventory.filter(
      (item) => item.storeItem?.type === 'super_like' && item.usesRemaining > 0,
    );

    if (superLikeItems.length === 0) {
      log(
        '⚠️ No Super Likes available in inventory. Need to purchase first.',
        'warning',
      );
      return false;
    }

    log(
      `Found ${superLikeItems.length} Super Like items with uses remaining`,
      'success',
    );

    // Send Super Like
    log('\n2. Sending Super Like...', 'info');
    const superLikeResult = await makeRequest(
      'POST',
      '/store/actions/super-like',
      { targetUserId: TARGET_USER_ID },
      `Sending Super Like to user ${TARGET_USER_ID}`,
    );

    // Check updated inventory
    log('\n3. Checking updated inventory...', 'info');
    await delay(1000); // Wait a bit for database update
    const updatedInventory = await makeRequest(
      'GET',
      '/store/inventory',
      null,
      'Getting updated inventory',
    );

    const updatedSuperLikes = updatedInventory.filter(
      (item) => item.storeItem?.type === 'super_like',
    );

    log(
      `Updated Super Like inventory: ${updatedSuperLikes.length} items`,
      'info',
    );
    updatedSuperLikes.forEach((item) => {
      console.log(
        `  - ${item.storeItem.name}: ${item.usesRemaining} uses remaining`,
      );
    });

    return true;
  } catch (error) {
    log('❌ Super Like test failed', 'error');
    return false;
  }
}

async function testProfileBoost() {
  log('\n🚀 ===== TESTING PROFILE BOOST =====', 'bold');

  try {
    // Check boost inventory
    log('\n1. Checking Boost inventory...', 'info');
    const inventory = await makeRequest(
      'GET',
      '/store/inventory',
      null,
      'Getting user inventory',
    );

    const boostItems = inventory.filter(
      (item) =>
        item.storeItem?.type === 'boost' &&
        (item.usesRemaining > 0 || !item.storeItem.name.includes('consumed')),
    );

    if (boostItems.length === 0) {
      log(
        '⚠️ No Boosts available in inventory. Need to purchase first.',
        'warning',
      );
      return false;
    }

    log(`Found ${boostItems.length} Boost items available`, 'success');

    // Activate Profile Boost
    log('\n2. Activating Profile Boost...', 'info');
    const boostResult = await makeRequest(
      'POST',
      '/store/actions/profile-boost',
      { boostType: 'boost-3h' },
      'Activating 3-hour profile boost',
    );

    // Check active boosts
    log('\n3. Checking active boosts...', 'info');
    await delay(1000);
    const activeInventory = await makeRequest(
      'GET',
      '/store/my-inventory/active',
      null,
      'Getting active inventory',
    );

    const activeBoosts = activeInventory.filter(
      (item) => item.storeItem?.type === 'boost' && item.isActive,
    );

    log(`Active boosts: ${activeBoosts.length}`, 'success');
    activeBoosts.forEach((item) => {
      console.log(
        `  - ${item.storeItem.name}: Active since ${item.metadata?.activatedAt}`,
      );
    });

    return true;
  } catch (error) {
    log('❌ Profile Boost test failed', 'error');
    return false;
  }
}

async function testSeeWhoLiked() {
  log('\n👀 ===== TESTING SEE WHO LIKED =====', 'bold');

  try {
    // Check See Who Liked inventory
    log('\n1. Checking See Who Liked inventory...', 'info');
    const inventory = await makeRequest(
      'GET',
      '/store/inventory',
      null,
      'Getting user inventory',
    );

    const seeWhoLikedItems = inventory.filter(
      (item) =>
        item.storeItem?.name?.toLowerCase().includes('see who liked') ||
        item.storeItem?.name?.toLowerCase().includes('reveal'),
    );

    if (seeWhoLikedItems.length === 0) {
      log(
        '⚠️ No "See Who Liked" items available in inventory. Need to purchase first.',
        'warning',
      );
      return false;
    }

    log(`Found ${seeWhoLikedItems.length} "See Who Liked" items`, 'success');

    // Reveal likes
    log('\n2. Revealing who liked you...', 'info');
    const revealResult = await makeRequest(
      'POST',
      '/store/actions/reveal-likes',
      {},
      'Activating See Who Liked feature',
    );

    // Check if feature is active
    log('\n3. Checking active features...', 'info');
    await delay(1000);
    const activeFeatures = await makeRequest(
      'GET',
      '/store/my-inventory/active',
      null,
      'Getting active features',
    );

    const activeSeeWhoLiked = activeFeatures.filter(
      (item) =>
        item.storeItem?.name?.toLowerCase().includes('see who liked') &&
        item.isActive,
    );

    log(
      `Active "See Who Liked" features: ${activeSeeWhoLiked.length}`,
      'success',
    );

    return true;
  } catch (error) {
    log('❌ See Who Liked test failed', 'error');
    return false;
  }
}

async function testSwipeRewind() {
  log('\n⏪ ===== TESTING SWIPE REWIND =====', 'bold');

  try {
    // Check rewind inventory
    log('\n1. Checking Rewind inventory...', 'info');
    const inventory = await makeRequest(
      'GET',
      '/store/inventory',
      null,
      'Getting user inventory',
    );

    const rewindItems = inventory.filter(
      (item) =>
        item.storeItem?.type === 'rewind' ||
        item.storeItem?.name?.toLowerCase().includes('rewind'),
    );

    if (rewindItems.length === 0) {
      log(
        '⚠️ No Rewind items available in inventory. Need to purchase first.',
        'warning',
      );
      return false;
    }

    log(`Found ${rewindItems.length} Rewind items`, 'success');

    // Use rewind
    log('\n2. Using Swipe Rewind...', 'info');
    const rewindResult = await makeRequest(
      'POST',
      '/store/actions/swipe-rewind',
      {},
      'Rewinding last swipe action',
    );

    // Check updated inventory
    log('\n3. Checking updated inventory...', 'info');
    await delay(1000);
    const updatedInventory = await makeRequest(
      'GET',
      '/store/inventory',
      null,
      'Getting updated inventory',
    );

    const updatedRewinds = updatedInventory.filter(
      (item) => item.storeItem?.type === 'rewind',
    );

    log(`Updated Rewind inventory: ${updatedRewinds.length} items`, 'info');

    return true;
  } catch (error) {
    log('❌ Swipe Rewind test failed', 'error');
    return false;
  }
}

async function testGetActiveFeatures() {
  log('\n⚡ ===== TESTING GET ACTIVE FEATURES =====', 'bold');

  try {
    log('\n1. Getting all active store features...', 'info');
    const activeFeatures = await makeRequest(
      'GET',
      '/store/my-inventory/active',
      null,
      'Getting active store features',
    );

    log(`Total active features: ${activeFeatures.length}`, 'success');

    if (activeFeatures.length > 0) {
      console.log('\n📊 Active Features Breakdown:');

      const featuresByType = activeFeatures.reduce((acc, item) => {
        const type = item.storeItem?.type || 'unknown';
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {});

      Object.entries(featuresByType).forEach(([type, items]) => {
        console.log(`\n  ${type.toUpperCase()}:`);
        items.forEach((item) => {
          console.log(`    - ${item.storeItem.name}`);
          console.log(`      Active: ${item.isActive}`);
          console.log(`      Uses remaining: ${item.usesRemaining || 'N/A'}`);
          if (item.metadata?.activatedAt) {
            console.log(`      Activated: ${item.metadata.activatedAt}`);
          }
        });
      });
    } else {
      log('No active features found', 'warning');
    }

    return true;
  } catch (error) {
    log('❌ Get Active Features test failed', 'error');
    return false;
  }
}

async function testWalletBalance() {
  log('\n💰 ===== TESTING WALLET BALANCE =====', 'bold');

  try {
    log('\n1. Getting fuel wallet balance...', 'info');
    const fuelWallet = await makeRequest(
      'GET',
      '/fuel/wallet',
      null,
      'Getting fuel wallet',
    );

    log('\n2. Getting user balance from store...', 'info');

    // If there's a store balance endpoint, test it
    try {
      const storeBalance = await makeRequest(
        'GET',
        '/store/balance',
        null,
        'Getting store balance',
      );
    } catch (error) {
      log(
        'Store balance endpoint not found, using fuel wallet only',
        'warning',
      );
    }

    log(`Fuel balance: ${fuelWallet.balance || 0}`, 'success');

    return true;
  } catch (error) {
    log('❌ Wallet Balance test failed', 'error');
    return false;
  }
}

// Main test runner
async function runAllStoreActionTests() {
  log('\n🚀 ===== STORE ACTIONS COMPREHENSIVE TEST =====', 'bold');
  log('Testing all store action endpoints and functionality\n', 'info');

  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    results: [],
  };

  const tests = [
    { name: 'Wallet Balance', fn: testWalletBalance },
    { name: 'Get Active Features', fn: testGetActiveFeatures },
    { name: 'Super Like', fn: testSuperLike },
    { name: 'Profile Boost', fn: testProfileBoost },
    { name: 'See Who Liked', fn: testSeeWhoLiked },
    { name: 'Swipe Rewind', fn: testSwipeRewind },
  ];

  for (const test of tests) {
    testResults.total++;

    try {
      log(`\n${'='.repeat(50)}`, 'bold');
      const success = await test.fn();

      if (success) {
        testResults.passed++;
        testResults.results.push({ name: test.name, status: 'PASSED' });
        log(`\n✅ ${test.name} test PASSED`, 'success');
      } else {
        testResults.failed++;
        testResults.results.push({ name: test.name, status: 'FAILED' });
        log(`\n❌ ${test.name} test FAILED`, 'error');
      }
    } catch (error) {
      testResults.failed++;
      testResults.results.push({
        name: test.name,
        status: 'ERROR',
        error: error.message,
      });
      log(`\n💥 ${test.name} test ERROR: ${error.message}`, 'error');
    }

    // Wait between tests
    await delay(2000);
  }

  // Final results
  log('\n🏁 ===== TEST RESULTS SUMMARY =====', 'bold');
  log(`Total tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, 'error');
  log(
    `Success rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`,
    'info',
  );

  console.log('\n📊 Detailed Results:');
  testResults.results.forEach((result) => {
    const color = result.status === 'PASSED' ? 'success' : 'error';
    log(`  ${result.status}: ${result.name}`, color);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });

  log('\n✨ Store Actions testing completed!', 'bold');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllStoreActionTests().catch((error) => {
    log(`\n💥 Fatal error during testing: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  runAllStoreActionTests,
  testSuperLike,
  testProfileBoost,
  testSeeWhoLiked,
  testSwipeRewind,
  testGetActiveFeatures,
  testWalletBalance,
};
