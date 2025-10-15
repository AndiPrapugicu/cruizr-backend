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

async function testSpotlightBoostReality() {
  console.log('🔦 TESTING SPOTLIGHT BOOST - REAL FUNCTIONALITY CHECK');
  console.log('Checking if your activated Spotlight Boost actually works\n');

  try {
    // 1. Get current inventory to see active boosts
    console.log('📦 Step 1: Checking inventory for active boosts...');
    const inventory = await api.get('/store/inventory');

    const activeBoosts = inventory.data.filter(
      (item) =>
        item.isActive &&
        (item.storeItem.name.toLowerCase().includes('spotlight') ||
          item.storeItem.name.toLowerCase().includes('boost')),
    );

    console.log(`Found ${activeBoosts.length} active boost(s):`);
    activeBoosts.forEach((boost) => {
      console.log(`  ✅ ${boost.storeItem.name} (ID: ${boost.id})`);
      console.log(`     Active: ${boost.isActive}`);
      console.log(
        `     Activated at: ${boost.metadata?.activatedAt || 'Unknown'}`,
      );
      console.log(`     Uses remaining: ${boost.usesRemaining || 'N/A'}`);
    });

    if (activeBoosts.length === 0) {
      console.log(
        '❌ No active boosts found! First activate a boost from inventory.',
      );
      return;
    }

    // 2. Test profile boost endpoint directly
    console.log('\n🚀 Step 2: Testing profile boost endpoint...');
    try {
      // Try spotlight-30min (the correct endpoint type)
      const boostResponse = await api.post(
        '/store/actions/profile-boost/spotlight-30min',
      );
      console.log('🎉 SUCCESS! Profile boost endpoint works!');
      console.log('Response:', JSON.stringify(boostResponse.data, null, 2));
    } catch (error) {
      console.log(
        '❌ Profile boost failed:',
        error.response?.data?.message || error.message,
      );
      console.log('Full error response:', error.response?.data);

      // Try alternative boost types
      console.log('\n🔄 Trying alternative boost types...');
      const alternativeBoosts = ['boost-3h', 'super-boost-1h'];
      for (const boost of alternativeBoosts) {
        try {
          console.log(`Trying: ${boost}`);
          const response = await api.post(
            `/store/actions/profile-boost/${boost}`,
          );
          console.log(`✅ SUCCESS with ${boost}!`);
          console.log('Response:', JSON.stringify(response.data, null, 2));
          break;
        } catch (err) {
          console.log(`❌ Failed with ${boost}:`, err.response?.data?.message);
        }
      }
    }

    // 3. Check user profile to see if boost is actually applied
    console.log('\n👤 Step 3: Checking user profile for boost effects...');
    try {
      const userProfile = await api.get('/profile/me');
      console.log('Profile data received:');
      console.log(`  Name: ${userProfile.data.name}`);
      console.log(`  Premium status: ${userProfile.data.isPremium || false}`);
      console.log(
        `  Profile boosts active: ${JSON.stringify(userProfile.data.activeBoosts || 'None')}`,
      );
      console.log(
        `  Boost expiry: ${userProfile.data.boostExpiresAt || 'None'}`,
      );
      console.log(`  Last boost: ${userProfile.data.lastBoostTime || 'Never'}`);
    } catch (error) {
      console.log(
        '❌ Could not get profile data:',
        error.response?.data?.message,
      );
    }

    // 4. Check swipe queue to see if user appears boosted
    console.log('\n🎯 Step 4: Testing swipe queue for boosted visibility...');
    try {
      const swipeQueue = await api.get('/swipe/queue');
      console.log(`Swipe queue has ${swipeQueue.data.length} profiles`);

      // Check if our user appears in other users' queues with boost priority
      console.log('Queue priorities and boost status:');
      swipeQueue.data.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.name} (ID: ${profile.id})`);
        console.log(`     Boosted: ${profile.isBoosted || false}`);
        console.log(`     Priority: ${profile.priority || 'normal'}`);
      });
    } catch (error) {
      console.log(
        '❌ Could not get swipe queue:',
        error.response?.data?.message,
      );
    }

    // 5. Test with a different user to see if boosted profile appears first
    console.log("\n🔄 Step 5: Testing from another user's perspective...");
    try {
      // Using a different token to see if boosted profile appears with priority
      const otherUserToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoidGVzdDJAZXhhbXBsZS5jb20iLCJzdWIiOjIsIm5hbWUiOiJUZXN0IFVzZXIgMiIsImlhdCI6MTc1NDIxNzgwMSwiZXhwIjoxNzU0ODIyNjAxfQ.example';

      const otherUserApi = axios.create({
        baseURL: BASE_URL,
        headers: {
          Authorization: `Bearer ${otherUserToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const otherUserQueue = await otherUserApi.get('/swipe/queue');
      console.log(
        `Other user sees ${otherUserQueue.data.length} profiles in queue`,
      );

      // Check if our boosted user appears first/prioritized
      const ourBoostedProfile = otherUserQueue.data.find((p) => p.id === 1); // User ID 1
      if (ourBoostedProfile) {
        const position = otherUserQueue.data.indexOf(ourBoostedProfile) + 1;
        console.log(
          `🎯 Our boosted profile appears at position ${position} in other user's queue`,
        );
        console.log(
          `   Boosted status: ${ourBoostedProfile.isBoosted || false}`,
        );
        console.log(
          `   Priority level: ${ourBoostedProfile.priority || 'normal'}`,
        );
      } else {
        console.log("❌ Our profile not found in other user's queue");
      }
    } catch (error) {
      console.log(
        '⚠️ Could not test from other user perspective (may need valid token)',
      );
      console.log('Error:', error.response?.data?.message || error.message);
    }

    // 6. Final inventory check to see if uses were consumed
    console.log('\n📊 Step 6: Final inventory check for usage tracking...');
    const finalInventory = await api.get('/store/inventory');
    const finalBoosts = finalInventory.data.filter(
      (item) =>
        item.isActive &&
        (item.storeItem.name.toLowerCase().includes('spotlight') ||
          item.storeItem.name.toLowerCase().includes('boost')),
    );

    console.log('Final boost status:');
    finalBoosts.forEach((boost) => {
      console.log(`  📊 ${boost.storeItem.name}`);
      console.log(`     Still active: ${boost.isActive}`);
      console.log(`     Uses remaining: ${boost.usesRemaining || 'N/A'}`);
      console.log(
        `     Total active time: ${boost.metadata?.totalActiveTime || 0}ms`,
      );
    });

    // 7. Realtime usage test
    console.log('\n⚡ Step 7: Testing realtime boost usage...');
    try {
      const useResponse = await api.post(
        '/store/actions/profile-boost/spotlight-30min',
      );
      console.log('✅ Boost use successful!');
      console.log('Response details:', useResponse.data);

      // Check inventory immediately after use
      const postUseInventory = await api.get('/store/inventory');
      const postUseBoost = postUseInventory.data.find(
        (item) =>
          item.storeItem.name.toLowerCase().includes('spotlight') ||
          item.storeItem.name.toLowerCase().includes('boost'),
      );

      if (postUseBoost) {
        console.log('📉 After use:');
        console.log(
          `   Uses remaining: ${postUseBoost.usesRemaining || 'N/A'}`,
        );
        console.log(`   Still active: ${postUseBoost.isActive}`);
      }
    } catch (error) {
      console.log('❌ Boost usage failed:', error.response?.data?.message);
    }

    console.log('\n🏁 SPOTLIGHT BOOST REALITY CHECK COMPLETE!');
    console.log(
      'Check the results above to see if your boost actually works 🔦',
    );
  } catch (error) {
    console.log('💥 Test failed:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

testSpotlightBoostReality().catch(console.error);
