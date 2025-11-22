import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function testPurchase() {
  console.log('🧪 Testing Store Purchase System\n');

  try {
    // 1. Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Logged in successfully\n');

    // 2. Check current wallet balance
    console.log('2️⃣ Checking wallet balance...');
    const walletResponse = await axios.get(`${API_URL}/fuel/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`💰 Fuel Points: ${walletResponse.data.fuelPoints}`);
    console.log(`💎 Premium Points: ${walletResponse.data.premiumPoints}\n`);

    // 3. Get all store items
    console.log('3️⃣ Fetching store items...');
    const storeResponse = await axios.get(`${API_URL}/store/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`🛒 Total items in store: ${storeResponse.data.length}\n`);

    // Show first 5 fuel items
    const fuelItems = storeResponse.data
      .filter((item: any) => item.currency === 'fuel')
      .slice(0, 5);

    console.log('🔥 Sample Fuel Items:');
    fuelItems.forEach((item: any, index: number) => {
      console.log(
        `  ${index + 1}. ${item.name} - ${item.price} fuel (${item.itemId})`,
      );
    });
    console.log('');

    // 4. Try to purchase an item
    if (fuelItems.length > 0 && walletResponse.data.fuelPoints >= fuelItems[0].price) {
      const itemToBuy = fuelItems[0];
      console.log(`4️⃣ Attempting to purchase: ${itemToBuy.name}...\n`);

      const purchaseResponse = await axios.post(
        `${API_URL}/store/purchase`,
        { itemId: itemToBuy.itemId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (purchaseResponse.data.success) {
        console.log('✅ Purchase successful!');
        console.log(`   Transaction ID: ${purchaseResponse.data.transactionId}`);
        console.log(
          `   Item added to inventory: ${purchaseResponse.data.inventoryItem.id}\n`,
        );

        // 5. Check inventory
        console.log('5️⃣ Checking inventory...');
        const inventoryResponse = await axios.get(`${API_URL}/store/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(`📦 Total items in inventory: ${inventoryResponse.data.length}`);
        
        if (inventoryResponse.data.length > 0) {
          console.log('\n📋 Your items:');
          inventoryResponse.data.slice(0, 5).forEach((item: any, index: number) => {
            console.log(
              `  ${index + 1}. ${item.storeItem.name} - Active: ${item.isActive}, Uses: ${item.usesRemaining || 'Unlimited'}`,
            );
          });
        }
        console.log('');

        // 6. Check updated wallet balance
        console.log('6️⃣ Updated wallet balance...');
        const newWalletResponse = await axios.get(`${API_URL}/fuel/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(`💰 Fuel Points: ${newWalletResponse.data.fuelPoints}`);
        console.log(`💎 Premium Points: ${newWalletResponse.data.premiumPoints}\n`);
      }
    } else {
      console.log('⚠️ Not enough fuel points to purchase first item\n');
      console.log('💡 Add some fuel points to test purchasing:');
      console.log('   - Use daily login bonus');
      console.log('   - Or update wallet manually in database\n');
    }

    console.log('✅ Test completed successfully!\n');
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPurchase();
