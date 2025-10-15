const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Token pentru TestDoi (user ID 9)
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQGVtYWlsLmNvbSIsInN1YiI6OSwibmFtZSI6IlRlc3REb2kiLCJpYXQiOjE3NTQyMjQwMTcsImV4cCI6MTc1NDgyODgxN30.VyXPUtV9aAbEMnLZsbQd620Sn9pRIldce1u97sevmTg';

async function checkStore() {
  console.log('🏪 Checking store items...');

  try {
    // Verificăm ce items sunt în store
    const storeResponse = await axios.get(`${BASE_URL}/store/items`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('\n📦 Store items found:', storeResponse.data.length);
    storeResponse.data.forEach((item) => {
      console.log(
        `  - ${item.name} (ID: ${item.itemId}, Category: ${item.category}, Currency: ${item.currency})`,
      );
    });

    // Căutăm Profile Frame
    const profileFrame = storeResponse.data.find(
      (item) => item.itemId === 'profile-frame',
    );

    if (!profileFrame) {
      console.log('\n❌ Profile Frame not found in store!');
      console.log('📝 Need to add Profile Frame to store...');

      // Să adăugăm Profile Frame manual prin endpoint
      await addProfileFrame();
    } else {
      console.log('\n✅ Profile Frame found in store!');

      // Să testăm cumpărarea
      await testPurchaseProfileFrame();
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function addProfileFrame() {
  console.log('\n➕ Adding Profile Frame to store...');

  try {
    const response = await axios.post(
      `${BASE_URL}/store/items`,
      {
        itemId: 'profile-frame',
        name: 'Profile Frame',
        description: 'Add a stylish frame around your profile picture',
        icon: '🖼️',
        price: 100,
        currency: 'fuel',
        category: 'customization',
        subcategory: null,
        duration: null,
        maxUses: null,
        isActive: true,
        isPermanent: true,
        isLimited: false,
        limitedQuantity: null,
        requirements: null,
        effects: {
          type: 'cosmetic',
          effect: 'profile_frame',
        },
        metadata: {
          rarity: 'common',
          visual: 'golden_frame',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('✅ Profile Frame added successfully:', response.data);

    // Acum să testăm cumpărarea
    await testPurchaseProfileFrame();
  } catch (error) {
    console.error(
      '❌ Error adding Profile Frame:',
      error.response?.data || error.message,
    );
  }
}

async function testPurchaseProfileFrame() {
  console.log('\n💰 Testing Profile Frame purchase...');

  try {
    const response = await axios.post(
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

    console.log('✅ Purchase successful:', response.data);

    // Verificăm inventarul
    await checkInventory();
  } catch (error) {
    console.error('❌ Purchase error:', error.response?.data || error.message);
  }
}

async function checkInventory() {
  console.log('\n🎒 Checking inventory...');

  try {
    const response = await axios.get(`${BASE_URL}/store/inventory`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📦 Inventory items:', response.data.length);
    response.data.forEach((item) => {
      console.log(
        `  - ${item.storeItem?.name || 'Unknown'} (ID: ${item.itemId}, Active: ${item.isActive})`,
      );
    });

    // Căutăm Profile Frame în inventory
    const profileFrame = response.data.find(
      (item) => item.itemId === 'profile-frame',
    );

    if (profileFrame) {
      console.log('\n✅ Profile Frame found in inventory!');
      await testActivation(profileFrame);
    } else {
      console.log('\n❌ Profile Frame not found in inventory');
    }
  } catch (error) {
    console.error('❌ Inventory error:', error.response?.data || error.message);
  }
}

async function testActivation(inventoryItem) {
  console.log('\n🔧 Testing Profile Frame activation...');

  try {
    if (inventoryItem.isActive) {
      console.log('Profile Frame is already active, deactivating first...');

      const deactivateResponse = await axios.post(
        `${BASE_URL}/store/deactivate`,
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

      console.log('✅ Deactivation result:', deactivateResponse.data);
    }

    // Acum activăm
    console.log('Activating Profile Frame...');

    const activateResponse = await axios.post(
      `${BASE_URL}/store/activate`,
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

    console.log('✅ Activation result:', activateResponse.data);

    // Verificăm din nou inventarul
    console.log('\n🔍 Checking inventory after activation...');
    await checkInventory();
  } catch (error) {
    console.error(
      '❌ Activation error:',
      error.response?.data || error.message,
    );
  }
}

// Rulează testul
checkStore();
