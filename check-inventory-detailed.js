const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const USER1_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZGlAYW5kaS5jb20iLCJzdWIiOjEsInVzZXJJZCI6MSwibmFtZSI6IkFuZGkgSGF0eiIsImlhdCI6MTc1NDU2Mjk0MCwiZXhwIjoxNzU1MTY3NzQwfQ.M9X3QaZ4drt4RnieY4llPTD3gDOkeTO0G8wKhqErh6A';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${USER1_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

async function checkInventoryStatus() {
  console.log('📦 CHECKING INVENTORY STATUS');
  console.log('Looking at all items in inventory\n');

  try {
    const inventory = await api.get('/store/inventory');
    console.log(`Total inventory items: ${inventory.data.length}\n`);

    console.log('📋 ALL INVENTORY ITEMS:');
    inventory.data.forEach((item, index) => {
      console.log(
        `${index + 1}. ${item.storeItem?.name || 'Unknown'} (ID: ${item.id})`,
      );
      console.log(`   Store Item ID: ${item.storeItem?.id || 'N/A'}`);
      console.log(`   Item ID: ${item.storeItem?.itemId || 'N/A'}`);
      console.log(`   Active: ${item.isActive}`);
      console.log(`   Uses remaining: ${item.usesRemaining || 'N/A'}`);
      console.log(`   Purchased: ${item.purchaseDate}`);
      console.log(`   Expiry: ${item.expiryDate || 'None'}`);
      console.log(`   Metadata: ${JSON.stringify(item.metadata || {})}`);
      console.log('');
    });

    // Find boost items specifically
    const boostItems = inventory.data.filter(
      (item) =>
        item.storeItem?.type === 'boost' ||
        item.storeItem?.name?.toLowerCase().includes('boost') ||
        item.storeItem?.name?.toLowerCase().includes('spotlight'),
    );

    console.log(`\n🚀 BOOST ITEMS FOUND: ${boostItems.length}`);
    boostItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.storeItem.name}`);
      console.log(`   itemId: "${item.storeItem.itemId}"`);
      console.log(`   Active: ${item.isActive}`);
      console.log(`   Type: ${item.storeItem.type}`);

      // Check if expired
      if (item.expiryDate) {
        const isExpired = new Date(item.expiryDate) < new Date();
        console.log(`   Expired: ${isExpired}`);
      }

      // Check duration-based expiry
      if (item.metadata?.activatedAt) {
        const activatedTime = new Date(item.metadata.activatedAt);
        const now = new Date();
        const hoursActive =
          (now.getTime() - activatedTime.getTime()) / (1000 * 60 * 60);
        console.log(`   Hours active: ${hoursActive.toFixed(2)}`);

        // Spotlight is 1 hour
        if (item.storeItem.name.includes('1h') && hoursActive >= 1) {
          console.log(
            `   ⚠️ Should be expired (active for ${hoursActive.toFixed(2)} hours)`,
          );
        }
      }

      console.log('');
    });

    // Show expected boost types for endpoints
    console.log('\n🎯 EXPECTED BOOST TYPES FOR ENDPOINTS:');
    console.log('Backend expects these itemId values:');
    console.log('  • spotlight-30min (30 min, 3x multiplier)');
    console.log('  • boost-3h (3 hours, 5x multiplier)');
    console.log('  • super-boost-1h (1 hour, 10x multiplier)');

    console.log('\n🔍 WHAT YOU HAVE vs WHAT BACKEND EXPECTS:');
    boostItems.forEach((item) => {
      const itemId = item.storeItem.itemId;
      const isAccepted = [
        'spotlight-30min',
        'boost-3h',
        'super-boost-1h',
      ].includes(itemId);
      console.log(
        `  ${itemId}: ${isAccepted ? '✅ ACCEPTED' : '❌ NOT ACCEPTED'}`,
      );
    });
  } catch (error) {
    console.log('💥 Error:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

checkInventoryStatus().catch(console.error);
