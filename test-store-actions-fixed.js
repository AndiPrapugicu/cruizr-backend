const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidGVzdDQ1NkBleGFtcGxlLmNvbSIsInN1YiI6NiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc1NDIxMzc4MSwiZXhwIjoxNzU0ODE4NTgxfQ.GHiDaiQaltM6I_Ch390D_hzoAcgN9ILRh0pH_KS2s-0';
const TARGET_USER_ID = 1;

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

async function testAllStoreActions() {
  console.log('🚀 COMPREHENSIVE STORE ACTIONS TEST');
  console.log('Testing with CORRECT endpoint URLs\n');

  // 1. Test Super Like
  console.log('🌟 TESTING SUPER LIKE');
  console.log('='.repeat(30));
  try {
    const response = await api.post('/store/actions/super-like', {
      targetUserId: TARGET_USER_ID,
    });
    console.log('✅ Super Like SUCCESS:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Super Like ERROR:', error.response?.status);
    console.log('Details:', error.response?.data?.message || error.message);
  }

  await new Promise((r) => setTimeout(r, 1000));

  // 2. Test Profile Boost (CORRECTED URL)
  console.log('\n🚀 TESTING PROFILE BOOST (CORRECTED)');
  console.log('='.repeat(30));
  try {
    // CORRECT FORMAT: /store/actions/profile-boost/:boostType
    const response = await api.post('/store/actions/profile-boost/boost-3h');
    console.log('✅ Profile Boost SUCCESS:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Profile Boost ERROR:', error.response?.status);
    console.log('Details:', error.response?.data?.message || error.message);
  }

  await new Promise((r) => setTimeout(r, 1000));

  // 3. Test See Who Liked
  console.log('\n👀 TESTING SEE WHO LIKED');
  console.log('='.repeat(30));
  try {
    const response = await api.post('/store/actions/reveal-likes');
    console.log('✅ See Who Liked SUCCESS:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ See Who Liked ERROR:', error.response?.status);
    console.log('Details:', error.response?.data?.message || error.message);
  }

  await new Promise((r) => setTimeout(r, 1000));

  // 4. Test Swipe Rewind
  console.log('\n⏪ TESTING SWIPE REWIND');
  console.log('='.repeat(30));
  try {
    const response = await api.post('/store/actions/swipe-rewind');
    console.log('✅ Swipe Rewind SUCCESS:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Swipe Rewind ERROR:', error.response?.status);
    console.log('Details:', error.response?.data?.message || error.message);
  }

  // 5. Purchase some items first to test functionality
  console.log('\n💰 TESTING PURCHASES FOR TESTING');
  console.log('='.repeat(30));

  try {
    // Purchase Super Likes
    console.log('Purchasing Super Likes...');
    const superLikePurchase = await api.post('/store/purchase', {
      itemId: 'super-like-5pack',
      quantity: 1,
    });
    console.log('✅ Super Like Purchase SUCCESS');

    await new Promise((r) => setTimeout(r, 2000));

    // Now test Super Like again
    console.log('\nTesting Super Like with purchased items...');
    const superLikeTest = await api.post('/store/actions/super-like', {
      targetUserId: TARGET_USER_ID,
    });
    console.log('✅ Super Like with items SUCCESS:', superLikeTest.status);
    console.log('Response:', JSON.stringify(superLikeTest.data, null, 2));
  } catch (error) {
    console.log('❌ Purchase/Test ERROR:', error.response?.status);
    console.log('Details:', error.response?.data?.message || error.message);
  }

  try {
    // Purchase Boosts
    console.log('\nPurchasing Boosts...');
    const boostPurchase = await api.post('/store/purchase', {
      itemId: 'boost-3h',
      quantity: 1,
    });
    console.log('✅ Boost Purchase SUCCESS');

    await new Promise((r) => setTimeout(r, 2000));

    // Now test Profile Boost again
    console.log('\nTesting Profile Boost with purchased items...');
    const boostTest = await api.post('/store/actions/profile-boost/boost-3h');
    console.log('✅ Profile Boost with items SUCCESS:', boostTest.status);
    console.log('Response:', JSON.stringify(boostTest.data, null, 2));
  } catch (error) {
    console.log('❌ Boost Purchase/Test ERROR:', error.response?.status);
    console.log('Details:', error.response?.data?.message || error.message);
  }

  try {
    // Purchase See Who Liked
    console.log('\nPurchasing See Who Liked...');
    const seeWhoLikedPurchase = await api.post('/store/purchase', {
      itemId: 'see-who-liked-1h',
      quantity: 1,
    });
    console.log('✅ See Who Liked Purchase SUCCESS');

    await new Promise((r) => setTimeout(r, 2000));

    // Now test See Who Liked again
    console.log('\nTesting See Who Liked with purchased items...');
    const seeWhoLikedTest = await api.post('/store/actions/reveal-likes');
    console.log('✅ See Who Liked with items SUCCESS:', seeWhoLikedTest.status);
    console.log('Response:', JSON.stringify(seeWhoLikedTest.data, null, 2));
  } catch (error) {
    console.log(
      '❌ See Who Liked Purchase/Test ERROR:',
      error.response?.status,
    );
    console.log('Details:', error.response?.data?.message || error.message);
  }

  // Final inventory check
  console.log('\n📦 FINAL INVENTORY CHECK');
  console.log('='.repeat(30));
  try {
    const inventory = await api.get('/store/inventory');
    console.log(`✅ Total items in inventory: ${inventory.data.length}`);

    const activeItems = inventory.data.filter((item) => item.isActive);
    console.log(`🔥 Active items: ${activeItems.length}`);

    activeItems.forEach((item) => {
      console.log(`  - ${item.storeItem?.name} (${item.storeItem?.type})`);
    });
  } catch (error) {
    console.log('❌ Inventory check failed');
  }

  console.log('\n🏁 TESTING COMPLETED!');
  console.log(
    '✨ All store action endpoints have been tested with proper URLs',
  );
}

testAllStoreActions().catch(console.error);
