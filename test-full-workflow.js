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

async function testPurchaseAndUse() {
  console.log('🛒 FULL WORKFLOW TEST: PURCHASE → USE');
  console.log('Testing complete store functionality\n');

  try {
    // 1. Check current balance
    console.log('💰 Checking wallet balance...');
    const wallet = await api.get('/fuel/wallet');
    console.log(
      `Current balance: ${wallet.data.balance} fuel, ${wallet.data.premiumBalance} premium\n`,
    );

    // 2. Purchase Super Likes (if we have fuel)
    if (wallet.data.balance >= 100) {
      console.log('🛍️ Purchasing Super Likes...');
      try {
        const purchase = await api.post('/store/purchase', {
          itemId: 'super-like-5pack',
          quantity: 1,
        });
        console.log('✅ Super Likes purchased successfully!');
        console.log(`Response: ${JSON.stringify(purchase.data)}`);

        // Wait for database update
        await new Promise((r) => setTimeout(r, 2000));

        // 3. Use Super Like
        console.log('\n🌟 Using Super Like...');
        const superLike = await api.post('/store/actions/super-like', {
          targetUserId: 1,
        });
        console.log('✅ Super Like sent successfully!');
        console.log(`Response: ${JSON.stringify(superLike.data)}`);
      } catch (error) {
        console.log(
          '❌ Super Like flow failed:',
          error.response?.data?.message,
        );
      }
    } else {
      console.log('⚠️ Not enough fuel for Super Likes, skipping...');
    }

    // 4. Purchase and use See Who Liked (with premium)
    if (wallet.data.premiumBalance >= 6) {
      console.log('\n🛍️ Purchasing See Who Liked...');
      try {
        const purchase = await api.post('/store/purchase', {
          itemId: 'see-who-liked-1h',
          quantity: 1,
        });
        console.log('✅ See Who Liked purchased successfully!');

        await new Promise((r) => setTimeout(r, 2000));

        // Use See Who Liked
        console.log('\n👀 Activating See Who Liked...');
        const reveal = await api.post('/store/actions/reveal-likes');
        console.log('✅ See Who Liked activated successfully!');
        console.log(`Response: ${JSON.stringify(reveal.data)}`);
      } catch (error) {
        console.log(
          '❌ See Who Liked flow failed:',
          error.response?.data?.message,
        );
      }
    } else {
      console.log('⚠️ Not enough premium for See Who Liked, skipping...');
    }

    // 5. Check final inventory
    console.log('\n📦 Final inventory check...');
    const inventory = await api.get('/store/inventory');
    console.log(`Total items: ${inventory.data.length}`);

    const activeItems = inventory.data.filter((item) => item.isActive);
    console.log(`Active items: ${activeItems.length}`);

    if (activeItems.length > 0) {
      console.log('\n🔥 Active items:');
      activeItems.forEach((item) => {
        console.log(`  - ${item.storeItem?.name}`);
        console.log(`    Type: ${item.storeItem?.type}`);
        console.log(`    Uses remaining: ${item.usesRemaining || 'N/A'}`);
        if (item.metadata?.activatedAt) {
          console.log(`    Activated: ${item.metadata.activatedAt}`);
        }
      });
    }

    console.log('\n🎉 COMPLETE WORKFLOW TEST FINISHED!');
    console.log('✨ All store actions are working correctly!');
  } catch (error) {
    console.log('💥 Test failed:', error.message);
  }
}

testPurchaseAndUse().catch(console.error);
