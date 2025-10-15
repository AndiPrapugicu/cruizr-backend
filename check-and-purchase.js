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

async function checkStoreAndPurchase() {
  console.log('🔍 CHECKING AVAILABLE STORE ITEMS');
  console.log('Finding purchasable items for testing\n');

  try {
    // Get store items
    const storeResponse = await api.get('/store/items');
    const items = storeResponse.data;

    console.log(`Found ${items.length} total items in store\n`);

    // Filter relevant items for testing
    const relevantItems = items.filter(
      (item) =>
        ['super_like', 'boost'].includes(item.type) ||
        item.name?.toLowerCase().includes('see who liked') ||
        item.name?.toLowerCase().includes('super like') ||
        item.name?.toLowerCase().includes('boost'),
    );

    console.log('🎯 RELEVANT ITEMS FOR TESTING:');
    console.log('================================');

    relevantItems.forEach((item) => {
      console.log(`📦 ${item.name}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Type: ${item.type || 'N/A'}`);
      console.log(`   Price: ${item.price} ${item.currency}`);
      console.log(`   Category: ${item.category || 'N/A'}`);
      console.log('');
    });

    // Check current balance
    const wallet = await api.get('/fuel/wallet');
    console.log('💰 CURRENT BALANCE:');
    console.log(`   Fuel: ${wallet.data.balance}`);
    console.log(`   Premium: ${wallet.data.premiumBalance}\n`);

    // Find cheapest items we can afford
    const affordableItems = relevantItems.filter((item) => {
      if (item.currency === 'fuel') {
        return item.price <= wallet.data.balance;
      } else if (item.currency === 'premium') {
        return item.price <= wallet.data.premiumBalance;
      }
      return false;
    });

    console.log('💸 AFFORDABLE ITEMS:');
    console.log('====================');

    if (affordableItems.length === 0) {
      console.log('❌ No affordable items found! Need more fuel/premium.');

      // Show cheapest items anyway
      const sortedItems = relevantItems.sort((a, b) => a.price - b.price);
      console.log('\n📉 CHEAPEST ITEMS:');
      sortedItems.slice(0, 5).forEach((item) => {
        console.log(`   ${item.name}: ${item.price} ${item.currency}`);
      });

      return;
    }

    affordableItems.forEach((item) => {
      console.log(
        `✅ ${item.name} - ${item.price} ${item.currency} (ID: ${item.id})`,
      );
    });

    // Try to purchase the cheapest affordable items
    console.log('\n🛒 ATTEMPTING PURCHASES:');
    console.log('=========================');

    for (const item of affordableItems.slice(0, 3)) {
      // Only buy first 3
      try {
        console.log(`Purchasing ${item.name}...`);

        const response = await api.post('/store/purchase', {
          itemId: item.id,
        });

        console.log(`✅ ${item.name} purchased successfully!`);
        if (response.data.message) {
          console.log(`   Message: ${response.data.message}`);
        }

        await new Promise((r) => setTimeout(r, 1000));
      } catch (error) {
        console.log(`❌ Failed to purchase ${item.name}:`);
        console.log(
          `   Error: ${error.response?.data?.message || error.message}`,
        );
      }
      console.log('');
    }

    // Check final inventory
    const inventory = await api.get('/store/inventory');
    console.log(`📦 FINAL INVENTORY: ${inventory.data.length} items total\n`);

    const testableItems = inventory.data.filter(
      (item) =>
        ['super_like', 'boost'].includes(item.storeItem?.type) ||
        item.storeItem?.name?.toLowerCase().includes('see who liked'),
    );

    if (testableItems.length > 0) {
      console.log('🎯 ITEMS READY FOR TESTING:');
      testableItems.forEach((item) => {
        console.log(`   ✅ ${item.storeItem.name}`);
        console.log(`      Uses: ${item.usesRemaining || 'N/A'}`);
        console.log(`      Active: ${item.isActive}`);
      });
    } else {
      console.log('❌ No testable items in inventory yet.');
    }
  } catch (error) {
    console.log('💥 Error:', error.response?.data?.message || error.message);
  }
}

checkStoreAndPurchase().catch(console.error);
