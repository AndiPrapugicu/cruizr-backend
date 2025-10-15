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

async function testBoostEndpointFix() {
  console.log('🔧 TESTING BOOST ENDPOINT COMPATIBILITY FIX');
  console.log('Checking which boost types actually work with backend\n');

  try {
    // 1. First purchase a compatible boost
    console.log('💰 Step 1: Purchase a boost with compatible itemId...');

    // Get store items to see what's available
    const storeItems = await api.get('/store/items');

    console.log('\n📦 Available boost items in store:');
    const boostItems = storeItems.data.filter(
      (item) =>
        item.type === 'boost' ||
        item.name.toLowerCase().includes('boost') ||
        item.name.toLowerCase().includes('spotlight'),
    );

    boostItems.forEach((item) => {
      console.log(`  • ${item.name} (itemId: "${item.itemId}")`);
      console.log(
        `    Duration: ${item.duration || 'N/A'}, Price: ${item.price} ${item.currency}`,
      );
    });

    // 2. Try to purchase Profile Boost 3h if it exists
    console.log('\n🛒 Step 2: Looking for boost-3h or compatible item...');
    const boost3h = boostItems.find((item) => item.itemId === 'boost-3h');
    const profileBoost1h = boostItems.find(
      (item) => item.itemId === 'profile-boost-1h',
    );

    let targetItem = boost3h || profileBoost1h || boostItems[0];

    if (targetItem) {
      console.log(
        `Found item to purchase: ${targetItem.name} (${targetItem.itemId})`,
      );

      try {
        const purchase = await api.post('/store/purchase', {
          itemId: targetItem.itemId,
          quantity: 1,
        });
        console.log('✅ Purchase successful!');

        // Wait a bit for purchase to process
        await new Promise((r) => setTimeout(r, 2000));

        // 3. Test the endpoint with the exact itemId from store
        console.log(
          `\n🚀 Step 3: Testing endpoint with itemId: ${targetItem.itemId}...`,
        );

        // Map store itemId to backend expected format
        let endpointId = targetItem.itemId;

        // Try mapping
        const idMappings = {
          'profile-boost-1h': 'super-boost-1h',
          'profile-boost-6h': 'boost-3h',
          'spotlight-boost-1h': 'spotlight-30min',
        };

        if (idMappings[targetItem.itemId]) {
          endpointId = idMappings[targetItem.itemId];
          console.log(`Mapping ${targetItem.itemId} → ${endpointId}`);
        }

        try {
          const response = await api.post(
            `/store/actions/profile-boost/${endpointId}`,
          );
          console.log('🎉 SUCCESS! Boost activation worked!');
          console.log('Response:', JSON.stringify(response.data, null, 2));
        } catch (error) {
          console.log('❌ Endpoint failed:', error.response?.data?.message);

          // Try with the original itemId
          console.log(
            `\n🔄 Trying with original itemId: ${targetItem.itemId}...`,
          );
          try {
            const response2 = await api.post(
              `/store/actions/profile-boost/${targetItem.itemId}`,
            );
            console.log('🎉 SUCCESS with original itemId!');
            console.log('Response:', JSON.stringify(response2.data, null, 2));
          } catch (error2) {
            console.log(
              '❌ Original itemId also failed:',
              error2.response?.data?.message,
            );

            // Try all possible endpoint IDs
            console.log('\n🔍 Testing all possible endpoint formats...');
            const possibleIds = [
              'spotlight-30min',
              'boost-3h',
              'super-boost-1h',
            ];

            for (const testId of possibleIds) {
              try {
                const testResponse = await api.post(
                  `/store/actions/profile-boost/${testId}`,
                );
                console.log(`✅ SUCCESS with ${testId}!`);
                console.log(
                  'Response:',
                  JSON.stringify(testResponse.data, null, 2),
                );
                break;
              } catch (testError) {
                console.log(
                  `❌ Failed with ${testId}:`,
                  testError.response?.data?.message,
                );
              }
            }
          }
        }
      } catch (purchaseError) {
        console.log(
          '❌ Purchase failed:',
          purchaseError.response?.data?.message,
        );
      }
    } else {
      console.log('❌ No boost items found in store');
    }

    // 4. Show the conclusion
    console.log('\n📋 CONCLUSION - BOOST ENDPOINT COMPATIBILITY:');
    console.log('');
    console.log('🚨 ISSUE IDENTIFIED:');
    console.log(
      '  • Store items use itemIds like: spotlight-boost-1h, profile-boost-6h',
    );
    console.log(
      '  • Backend endpoints expect: spotlight-30min, boost-3h, super-boost-1h',
    );
    console.log('  • These are DIFFERENT and incompatible!');
    console.log('');
    console.log('✅ SOLUTION OPTIONS:');
    console.log('  1. Update backend to accept store itemIds');
    console.log('  2. Update store items to use backend-expected itemIds');
    console.log('  3. Add mapping layer between store and backend');
    console.log('');
    console.log('🎯 RECOMMENDATION:');
    console.log(
      '  Fix the itemId mismatch to make store purchases work with endpoints!',
    );
  } catch (error) {
    console.log('💥 Test failed:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

testBoostEndpointFix().catch(console.error);
