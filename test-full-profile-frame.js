const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Token pentru TestDoi user (ID: 9)
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInN1YiI6OSwibmFtZSI6IlRlc3REb2kiLCJpYXQiOjE3NTQyMjQwMTcsImV4cCI6MTc1NDgyODgxN30.VyXPUtV9aAbEMnLZsbQd620Sn9pRIldce1u97sevmTg';

async function addFuelAndTest() {
  console.log('⛽ Adding fuel to user and testing Profile Frame...');

  try {
    // 1. Verifică wallet-ul curent
    console.log('\n1️⃣ Checking current wallet...');
    const walletResponse = await axios.get(`${BASE_URL}/fuel/wallet`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('💰 Current wallet:', walletResponse.data);

    // 2. Adaugă fuel pentru a putea cumpăra Profile Frame (costă 100 fuel)
    console.log('\n2️⃣ Adding 200 fuel to wallet...');
    const addFuelResponse = await axios.post(
      `${BASE_URL}/fuel/add-fuel`,
      {
        amount: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Fuel added:', addFuelResponse.data);

    // 3. Cumpără Profile Frame
    console.log('\n3️⃣ Purchasing Profile Frame...');
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

    console.log('✅ Purchase result:', purchaseResponse.data);

    // 4. Verifică inventarul
    console.log('\n4️⃣ Checking inventory...');
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

    if (profileFrame) {
      console.log('✅ Profile Frame found in inventory:', {
        id: profileFrame.id,
        itemId: profileFrame.itemId,
        isActive: profileFrame.isActive,
        storeItem: profileFrame.storeItem?.name,
      });

      // 5. Testează activarea
      console.log('\n5️⃣ Testing activation...');
      await testActivation(profileFrame);
    } else {
      console.log('❌ Profile Frame not found in inventory');
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testActivation(inventoryItem) {
  try {
    const itemId = inventoryItem.storeItem?.itemId || inventoryItem.itemId;

    if (inventoryItem.isActive) {
      console.log('🔄 Item is active, testing deactivation...');
      const response = await axios.post(
        `${BASE_URL}/store/deactivate`,
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

      console.log('✅ Deactivation result:', response.data);
    } else {
      console.log('🔄 Item is inactive, testing activation...');
      const response = await axios.post(
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

      console.log('✅ Activation result:', response.data);
    }

    // Verifică din nou inventarul
    console.log('\n6️⃣ Verifying activation status...');
    const newInventoryResponse = await axios.get(
      `${BASE_URL}/store/inventory`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const updatedItem = newInventoryResponse.data.find(
      (item) => item.id === inventoryItem.id,
    );

    if (updatedItem) {
      console.log(
        `✅ Profile Frame status: ${updatedItem.isActive ? 'ACTIVE' : 'INACTIVE'}`,
      );
      console.log('🎉 Test completed successfully!');
    } else {
      console.log('❌ Could not find updated item in inventory');
    }
  } catch (error) {
    console.error(
      '❌ Activation error:',
      error.response?.data || error.message,
    );
  }
}

// Rulează testul
addFuelAndTest();
