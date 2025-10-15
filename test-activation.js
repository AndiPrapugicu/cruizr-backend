const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Token pentru TestDoi (user ID 9)
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInN1YiI6OSwibmFtZSI6IlRlc3REb2kiLCJpYXQiOjE3NTQyMjQwMTcsImV4cCI6MTc1NDgyODgxN30.VyXPUtV9aAbEMnLZsbQd620Sn9pRIldce1u97sevmTg';

async function testActivation() {
  console.log('🧪 Testing Profile Frame activation...');

  try {
    // 1. Mai întâi să verificăm inventarul
    console.log('\n1️⃣ Checking user inventory...');
    const inventoryResponse = await axios.get(`${BASE_URL}/store/inventory`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📦 Inventory items found:', inventoryResponse.data.length);
    inventoryResponse.data.forEach((item) => {
      console.log(
        `  - ${item.storeItem?.name || 'Unknown'} (ID: ${item.itemId}, Active: ${item.isActive})`,
      );
    });

    // 2. Să găsim Profile Frame în inventar
    const profileFrame = inventoryResponse.data.find(
      (item) =>
        item.itemId === 'profile-frame' ||
        item.storeItem?.itemId === 'profile-frame',
    );

    if (!profileFrame) {
      console.log('\n❌ Profile Frame not found in inventory!');

      // Să cumpărăm mai întâi un Profile Frame
      console.log('\n💰 Trying to purchase Profile Frame...');
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

      // Verificăm din nou inventarul
      const newInventoryResponse = await axios.get(
        `${BASE_URL}/store/inventory`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const newProfileFrame = newInventoryResponse.data.find(
        (item) =>
          item.itemId === 'profile-frame' ||
          item.storeItem?.itemId === 'profile-frame',
      );

      if (newProfileFrame) {
        console.log('✅ Profile Frame found after purchase!');
        return testActivateItem(newProfileFrame);
      } else {
        console.log('❌ Still no Profile Frame in inventory after purchase');
        return;
      }
    }

    console.log(
      `\n✅ Profile Frame found! Current status: ${profileFrame.isActive ? 'Active' : 'Inactive'}`,
    );

    // 3. Testăm activarea
    await testActivateItem(profileFrame);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testActivateItem(inventoryItem) {
  console.log('\n2️⃣ Testing item activation...');
  console.log('📝 Item details:', {
    id: inventoryItem.id,
    itemId: inventoryItem.itemId,
    storeItemId: inventoryItem.storeItem?.itemId,
    isActive: inventoryItem.isActive,
  });

  try {
    const itemId = inventoryItem.storeItem?.itemId || inventoryItem.itemId;

    if (inventoryItem.isActive) {
      // Dezactivează
      console.log('🔄 Deactivating item...');
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
      // Activează
      console.log('🔄 Activating item...');
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

    // Verificăm din nou inventarul
    console.log('\n3️⃣ Checking inventory after action...');
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
        `✅ Item status updated! New status: ${updatedItem.isActive ? 'Active' : 'Inactive'}`,
      );
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
testActivation();
