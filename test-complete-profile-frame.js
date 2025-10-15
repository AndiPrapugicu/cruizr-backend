const Database = require('better-sqlite3');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInN1YiI6OSwibmFtZSI6IlRlc3REb2kiLCJpYXQiOjE3NTQyMjQwMTcsImV4cCI6MTc1NDgyODgxN30.VyXPUtV9aAbEMnLZsbQd620Sn9pRIldce1u97sevmTg';

async function testProfileFrameComplete() {
  console.log('🎯 Complete Profile Frame Test...');

  try {
    // 1. Add fuel directly to database
    console.log('\n1️⃣ Adding fuel directly to database...');
    const db = new Database('./database.sqlite');

    // Update wallet balance
    const updateWallet = db.prepare(`
      UPDATE wallets 
      SET balance = balance + 200, 
          totalEarned = totalEarned + 200,
          updatedAt = CURRENT_TIMESTAMP
      WHERE userId = 9
    `);

    const result = updateWallet.run();
    console.log('✅ Wallet updated:', result);

    // Check new balance
    const getWallet = db.prepare('SELECT * FROM wallets WHERE userId = 9');
    const wallet = getWallet.get();
    console.log('💰 New wallet balance:', wallet.balance);

    db.close();

    // 2. Purchase Profile Frame
    console.log('\n2️⃣ Purchasing Profile Frame...');
    const purchaseResponse = await axios.post(
      `${BASE_URL}/store/purchase`,
      {
        itemId: 'profile-frame',
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Purchase successful:', purchaseResponse.data);

    // 3. Check inventory
    console.log('\n3️⃣ Checking inventory...');
    const inventoryResponse = await axios.get(`${BASE_URL}/store/inventory`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📦 Inventory items:', inventoryResponse.data.length);

    const profileFrame = inventoryResponse.data.find(
      (item) =>
        item.itemId === 'profile-frame' ||
        item.storeItem?.itemId === 'profile-frame',
    );

    if (!profileFrame) {
      console.log('❌ Profile Frame not found in inventory!');
      return;
    }

    console.log('✅ Profile Frame found:', {
      id: profileFrame.id,
      itemId: profileFrame.itemId,
      isActive: profileFrame.isActive,
      storeItemId: profileFrame.storeItem?.itemId,
    });

    // 4. Test activation
    console.log('\n4️⃣ Testing activation...');
    const itemId = profileFrame.storeItem?.itemId || profileFrame.itemId;

    const activateResponse = await axios.post(
      `${BASE_URL}/store/activate`,
      {
        itemId: itemId,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Activation successful:', activateResponse.data);

    // 5. Verify activation
    console.log('\n5️⃣ Verifying activation...');
    const newInventoryResponse = await axios.get(
      `${BASE_URL}/store/inventory`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const activatedFrame = newInventoryResponse.data.find(
      (item) => item.id === profileFrame.id,
    );

    if (activatedFrame && activatedFrame.isActive) {
      console.log(
        '🎉 SUCCESS! Profile Frame is now active:',
        activatedFrame.isActive,
      );
    } else {
      console.log('❌ Profile Frame activation failed');
    }

    // 6. Check active items
    console.log('\n6️⃣ Checking active items...');
    const activeItemsResponse = await axios.get(
      `${BASE_URL}/store/inventory/active`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('🔥 Active items:', activeItemsResponse.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testProfileFrameComplete();
