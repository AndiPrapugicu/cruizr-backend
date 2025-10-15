const axios = require('axios');

const BASE_URL =           const activateResponse = await api.post('/store/activate', {
            itemId: seeWhoLikedItem.id.toString()
          });tp://localhost:3000';
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

async function testWithPurchasedItems() {
  console.log('🧪 TESTING WITH PURCHASED ITEMS');
  console.log('Activating and testing real store features\n');

  try {
    // 1. Check current inventory
    console.log('📦 Checking current inventory...');
    const inventory = await api.get('/store/inventory');

    console.log(`Total items: ${inventory.data.length}\n`);

    inventory.data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.storeItem.name}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Store Item ID: ${item.storeItem.id}`);
      console.log(`   Type: ${item.storeItem.type || 'N/A'}`);
      console.log(`   Active: ${item.isActive}`);
      console.log(`   Uses remaining: ${item.usesRemaining || 'N/A'}`);
      console.log('');
    });

    // 2. Find the See Who Liked item
    const seeWhoLikedItem = inventory.data.find((item) =>
      item.storeItem.name.toLowerCase().includes('see who liked'),
    );

    if (seeWhoLikedItem) {
      console.log('🎯 Found "See Who Liked" item in inventory!');
      console.log(`Item: ${seeWhoLikedItem.storeItem.name}`);
      console.log(`Active: ${seeWhoLikedItem.isActive}`);

      // If not active, try to activate it first
      if (!seeWhoLikedItem.isActive) {
        console.log('\n⚡ Activating "See Who Liked" item...');
        try {
          const activateResponse = await api.post('/store/activate', {
            inventoryItemId: seeWhoLikedItem.id,
          });
          console.log('✅ Item activated successfully!');

          // Wait a moment for activation
          await new Promise((r) => setTimeout(r, 2000));
        } catch (error) {
          console.log(
            '❌ Failed to activate item:',
            error.response?.data?.message,
          );
        }
      }

      // Now test the reveal-likes endpoint
      console.log('\n👀 Testing See Who Liked endpoint...');
      try {
        const revealResponse = await api.post('/store/actions/reveal-likes');
        console.log('🎉 See Who Liked SUCCESS!');
        console.log('Response:', JSON.stringify(revealResponse.data, null, 2));
      } catch (error) {
        console.log('❌ See Who Liked failed:', error.response?.data?.message);
      }
    } else {
      console.log('❌ No "See Who Liked" item found in inventory');
    }

    // 3. Test other endpoints even without items (to verify they work)
    console.log(
      '\n🔄 Testing other endpoints (expected to fail without items):',
    );

    // Test Super Like
    try {
      await api.post('/store/actions/super-like', { targetUserId: 1 });
    } catch (error) {
      console.log(`✅ Super Like: ${error.response?.data?.message}`);
    }

    // Test Profile Boost
    try {
      await api.post('/store/actions/profile-boost/boost-3h');
    } catch (error) {
      console.log(`✅ Profile Boost: ${error.response?.data?.message}`);
    }

    // Test Swipe Rewind
    try {
      await api.post('/store/actions/swipe-rewind');
    } catch (error) {
      console.log(`✅ Swipe Rewind: ${error.response?.data?.message}`);
    }

    console.log('\n🏁 TESTING WITH PURCHASED ITEMS COMPLETED!');
  } catch (error) {
    console.log('💥 Error:', error.response?.data?.message || error.message);
  }
}

testWithPurchasedItems().catch(console.error);
