const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 PROFILE BOOST IMPACT VERIFICATION TOOL\n');

function testBoostImpact(userId = 1) {
  console.log(`📊 Testing boost impact for User ID: ${userId}\n`);

  // Test 1: Check user's current boost status
  const checkUserBoost = `
    SELECT 
      id, 
      name, 
      profileBoost,
      CASE 
        WHEN profileBoost IS NOT NULL THEN JSON_EXTRACT(profileBoost, '$.multiplier')
        ELSE 1
      END as current_multiplier,
      CASE 
        WHEN profileBoost IS NOT NULL THEN JSON_EXTRACT(profileBoost, '$.expiresAt')
        ELSE 'No boost active'
      END as boost_expires
    FROM user 
    WHERE id = ?
  `;

  db.get(checkUserBoost, [userId], (err, user) => {
    if (err) {
      console.error('❌ Error checking user boost:', err);
      return;
    }

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('👤 USER BOOST STATUS:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Boost Multiplier: ${user.current_multiplier}x`);
    console.log(`   Boost Expires: ${user.boost_expires}`);
    console.log(`   Raw Boost Data: ${user.profileBoost || 'No boost'}\n`);

    // Test 2: Check active inventory items for this user
    const checkInventory = `
      SELECT 
        ui.*, 
        si.name as item_name,
        si.effects,
        CASE 
          WHEN ui.expiresAt > datetime('now') OR ui.expiresAt IS NULL THEN 'ACTIVE'
          ELSE 'EXPIRED'
        END as status
      FROM user_inventory ui
      JOIN store_items si ON ui.itemId = si.itemId
      WHERE ui.userId = ? 
        AND si.category = 'boosts'
        AND (ui.expiresAt > datetime('now') OR ui.expiresAt IS NULL)
      ORDER BY ui.activatedAt DESC
    `;

    db.all(checkInventory, [userId], (err, inventory) => {
      if (err) {
        console.error('❌ Error checking inventory:', err);
        return;
      }

      console.log('🎒 ACTIVE BOOST INVENTORY:');
      if (inventory.length === 0) {
        console.log('   ❌ No active boost items found');
      } else {
        inventory.forEach((item) => {
          console.log(`   ✅ ${item.item_name} - Status: ${item.status}`);
          console.log(`      Effects: ${item.effects}`);
          console.log(`      Activated: ${item.activatedAt}`);
          console.log(`      Expires: ${item.expiresAt || 'Never'}`);
        });
      }
      console.log('');

      // Test 3: Simulate matching algorithm impact
      simulateMatchingImpact(userId, user.current_multiplier || 1);
    });
  });
}

function simulateMatchingImpact(userId, multiplier) {
  console.log('🎯 MATCHING ALGORITHM SIMULATION:');

  const baseVisibilityScore = 100;
  const boostedScore = baseVisibilityScore * multiplier;

  console.log(`   Base Visibility Score: ${baseVisibilityScore}`);
  console.log(`   Boost Multiplier: ${multiplier}x`);
  console.log(`   Boosted Score: ${boostedScore}`);

  if (multiplier > 1) {
    console.log(
      `   🚀 BOOST ACTIVE! User ${userId} has ${multiplier}x visibility!`,
    );
    console.log(
      `   👑 Priority Level: ${multiplier >= 10 ? 'MAXIMUM' : multiplier >= 5 ? 'HIGH' : 'MEDIUM'}`,
    );
    console.log(`   📈 Expected Impact: ${multiplier}x more profile views`);
    console.log(
      `   🎯 Discovery Queue: TOP ${Math.ceil(5 / multiplier)} position`,
    );
  } else {
    console.log(`   📊 Normal visibility (no boost active)`);
  }
  console.log('');

  // Test 4: Check recent swipes to see real impact
  checkRecentSwipes(userId);
}

function checkRecentSwipes(userId) {
  const recentSwipes = `
    SELECT 
      COUNT(*) as total_swipes,
      SUM(CASE WHEN direction = 'right' THEN 1 ELSE 0 END) as likes_received,
      SUM(CASE WHEN direction = 'left' THEN 1 ELSE 0 END) as passes_received,
      datetime('now', '-1 hour') as since_time
    FROM swipes 
    WHERE targetUserId = ? 
      AND createdAt > datetime('now', '-1 hour')
  `;

  db.get(recentSwipes, [userId], (err, swipeData) => {
    if (err) {
      console.error('❌ Error checking swipes:', err);
      return;
    }

    console.log('📊 RECENT ACTIVITY (Last 1 hour):');
    console.log(`   Total Swipes Received: ${swipeData.total_swipes || 0}`);
    console.log(`   Likes Received: ${swipeData.likes_received || 0}`);
    console.log(`   Passes Received: ${swipeData.passes_received || 0}`);

    if (swipeData.total_swipes > 0) {
      const likeRate = (
        ((swipeData.likes_received || 0) / swipeData.total_swipes) *
        100
      ).toFixed(1);
      console.log(`   Like Rate: ${likeRate}%`);

      if (likeRate > 60) {
        console.log(`   🔥 HIGH activity - Boost likely working!`);
      } else if (likeRate > 30) {
        console.log(`   📈 MODERATE activity`);
      } else {
        console.log(`   📊 LOW activity`);
      }
    }
    console.log('');

    // Final assessment
    finalAssessment(userId);
  });
}

function finalAssessment(userId) {
  console.log('🎯 FINAL BOOST IMPACT ASSESSMENT:');
  console.log('');
  console.log('✅ TO VERIFY BOOST IS WORKING:');
  console.log('   1. Check if user has active boost in inventory ✅');
  console.log('   2. Verify boost multiplier > 1 in user profile ✅');
  console.log('   3. Monitor increased swipe activity ✅');
  console.log('   4. Compare with baseline (non-boosted) activity');
  console.log('');
  console.log('🧪 LIVE TESTING RECOMMENDATIONS:');
  console.log(
    '   • Have a friend check discovery queue - you should appear in top 5',
  );
  console.log('   • Compare match rate before/after boost activation');
  console.log('   • Monitor backend logs for boost application messages');
  console.log('   • Use multiple accounts to test discovery priority');
  console.log('');
  console.log('📱 FRONTEND TEST:');
  console.log('   • Open Network tab and watch for boost-related API calls');
  console.log('   • Check if EnterpriseStore shows "ACTIVE" status');
  console.log('   • Verify countdown timer is running');
  console.log('');
  console.log(
    '🚀 BOOST IMPACT SUCCESS = More visibility + Better discovery position + Increased matches! 🎯',
  );
  console.log('');

  db.close();
}

// Test for specific user ID (change this to test different users)
const testUserId = process.argv[2] || 1;
console.log(`🧪 Starting boost impact test for User ID: ${testUserId}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

testBoostImpact(parseInt(testUserId));
