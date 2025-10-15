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

async function purchaseTestItems() {
  console.log('🛍️ PURCHASING TEST ITEMS FOR STORE ACTIONS');
  console.log('Buying items needed to test all store action endpoints\n');

  // 1. Check current balance first
  try {
    console.log('💰 Checking current balance...');
    const wallet = await api.get('/fuel/wallet');
    console.log(`Current fuel: ${wallet.data.balance}`);
    console.log(`Current premium: ${wallet.data.premiumBalance}\n`);
  } catch (error) {
    console.log('❌ Failed to check balance:', error.response?.data?.message);
    return;
  }

  // Items to purchase for testing
  const itemsToPurchase = [
    {
      itemId: 'super-like-5pack',
      quantity: 1,
      currency: 'fuel',
      description: 'Super Like 5-pack',
    },
    {
      itemId: 'boost-3h',
      quantity: 1,
      currency: 'fuel',
      description: '3-hour Profile Boost',
    },
    {
      itemId: 'see-who-liked-1h',
      quantity: 1,
      currency: 'premium',
      description: 'See Who Liked (1h)',
    },
    {
      itemId: 'spotlight-30min',
      quantity: 1,
      currency: 'fuel',
      description: 'Spotlight Boost (30min)',
    },
  ];

  console.log('🛒 Purchasing items for testing...\n');

  for (const item of itemsToPurchase) {
    try {
      console.log(`Purchasing ${item.description}...`);

      const response = await api.post('/store/purchase', {
        itemId: item.itemId,
      });

      console.log(`✅ ${item.description} purchased successfully!`);
      console.log(`Response: ${response.data.message || 'Success'}`);

      // Small delay between purchases
      await new Promise((r) => setTimeout(r, 1500));
    } catch (error) {
      console.log(`❌ Failed to purchase ${item.description}:`);
      console.log(
        `   Error: ${error.response?.data?.message || error.message}`,
      );
    }
    console.log('');
  }

  // Check updated balance and inventory
  try {
    console.log('📊 Checking updated balance and inventory...');

    const wallet = await api.get('/fuel/wallet');
    console.log(`\nUpdated fuel: ${wallet.data.balance}`);
    console.log(`Updated premium: ${wallet.data.premiumBalance}`);

    const inventory = await api.get('/store/inventory');
    console.log(`\nTotal inventory items: ${inventory.data.length}`);

    // Show relevant items
    const relevantItems = inventory.data.filter(
      (item) =>
        ['super_like', 'boost'].includes(item.storeItem?.type) ||
        item.storeItem?.name?.toLowerCase().includes('see who liked'),
    );

    if (relevantItems.length > 0) {
      console.log('\n🎒 Relevant items in inventory:');
      relevantItems.forEach((item) => {
        console.log(`  - ${item.storeItem.name}`);
        console.log(`    Type: ${item.storeItem.type || 'N/A'}`);
        console.log(`    Uses remaining: ${item.usesRemaining || 'N/A'}`);
        console.log(`    Active: ${item.isActive}`);
        console.log('');
      });
    }
  } catch (error) {
    console.log(
      '❌ Failed to check updated status:',
      error.response?.data?.message,
    );
  }

  console.log('🎉 PURCHASE PHASE COMPLETED!');
  console.log('✨ Ready to test store action endpoints with real items!');
}

purchaseTestItems().catch(console.error);
