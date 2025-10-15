const axios = require('axios');

async function testActivation() {
  console.log('🧪 Testing Super Like activation...');

  // Use token for user 1 who has inactive super-like-5pack
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFuZGlAYW5kaS5jb20iLCJzdWIiOjEsIm5hbWUiOiJBbmRpIEhhdHoiLCJpYXQiOjE3NTQ2NzIzOTUsImV4cCI6MTc4NjIwODM5NX0.7_r3_MX93Q1qxbBcCUm5d26Xsg-Xm15vY1v8HfF09RY';

  try {
    // First check current inventory
    console.log('📦 Checking current inventory...');
    const inventoryResponse = await axios.get(
      'http://localhost:3000/store/inventory',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const superLikeItems = inventoryResponse.data.filter(item => 
      item.itemId.includes('super-like')
    );

    console.log('🌟 Super Like items in inventory:');
    superLikeItems.forEach(item => {
      console.log(`  - ${item.itemId}: Active=${item.isActive}, Uses=${item.usesRemaining}`);
    });

    // Try to activate super-like-5pack for user 1
    console.log('\n🔧 Attempting to activate super-like-5pack...');
    const response = await axios.post(
      'http://localhost:3000/store/activate',
      {
        itemId: 'super-like-5pack'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Activation successful:', response.data);
  } catch (error) {
    console.log('❌ Activation failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('Message:', error.message);
  }
}

testActivation();
      console.log('❌ No "See Who Liked" item found');
      return;
    }

    console.log(`🎯 Found: ${seeWhoLikedItem.storeItem.name}`);
    console.log(`   ID: ${seeWhoLikedItem.id}`);
    console.log(`   Store Item ID: ${seeWhoLikedItem.storeItem.id}`);
    console.log(`   Active: ${seeWhoLikedItem.isActive}\n`);

    // Activate item if not active
    if (!seeWhoLikedItem.isActive) {
      console.log('⚡ Activating item...');
      try {
        const response = await api.post('/store/activate', {
          itemId: seeWhoLikedItem.id.toString(),
        });
        console.log('✅ Item activated successfully!');
        console.log('Response:', response.data);

        // Wait for activation
        await new Promise((r) => setTimeout(r, 3000));
      } catch (error) {
        console.log('❌ Activation failed:', error.response?.data);

        // Try with different field names
        console.log('\n🔄 Trying different activation formats...');

        const attempts = [
          { inventoryItemId: seeWhoLikedItem.id },
          { id: seeWhoLikedItem.id },
          { storeItemId: seeWhoLikedItem.storeItem.id },
        ];

        for (const attempt of attempts) {
          try {
            console.log(`Trying:`, attempt);
            const response = await api.post('/store/activate', attempt);
            console.log('✅ Success with:', attempt);
            break;
          } catch (err) {
            console.log('❌ Failed with:', attempt);
          }
        }
      }
    }

    // Now test the reveal-likes endpoint
    console.log('\n👀 Testing reveal-likes endpoint...');
    try {
      const response = await api.post('/store/actions/reveal-likes');
      console.log('🎉 SUCCESS! See Who Liked worked!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Still failed:', error.response?.data?.message);
      console.log('Full error:', error.response?.data);
    }

    // Check final inventory status
    console.log('\n📋 Final inventory check...');
    const finalInventory = await api.get('/store/inventory');
    const updatedItem = finalInventory.data.find(
      (item) => item.id === seeWhoLikedItem.id,
    );

    if (updatedItem) {
      console.log(`Final status - Active: ${updatedItem.isActive}`);
      console.log(`Uses remaining: ${updatedItem.usesRemaining || 'N/A'}`);
    }
  } catch (error) {
    console.log('💥 Error:', error.message);
  }
}

testActivateAndUse().catch(console.error);
