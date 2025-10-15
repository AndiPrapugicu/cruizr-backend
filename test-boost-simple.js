const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 PROFILE BOOST IMPACT VERIFICATION (SIMPLIFIED)\n');

function testBoostImpact(userId = 1) {
  console.log(`📊 Testing boost impact for User ID: ${userId}\n`);

  // Test 1: Check user's current boost status
  const checkUserBoost = `
    SELECT 
      id, 
      name, 
      profileBoost,
      CASE 
        WHEN profileBoost IS NOT NULL AND LENGTH(profileBoost) > 0 THEN JSON_EXTRACT(profileBoost, '$.multiplier')
        ELSE 1
      END as current_multiplier,
      CASE 
        WHEN profileBoost IS NOT NULL AND LENGTH(profileBoost) > 0 THEN JSON_EXTRACT(profileBoost, '$.expiresAt')
        ELSE 'No boost active'
      END as boost_expires,
      CASE 
        WHEN profileBoost IS NOT NULL AND LENGTH(profileBoost) > 0 THEN JSON_EXTRACT(profileBoost, '$.type')
        ELSE 'none'
      END as boost_type
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
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name || 'Unknown'}`);
    console.log(`   Boost Multiplier: ${user.current_multiplier || 1}x`);
    console.log(`   Boost Type: ${user.boost_type}`);
    console.log(`   Boost Expires: ${user.boost_expires}`);
    console.log(
      `   Raw Boost Data: ${user.profileBoost || 'No boost active'}\n`,
    );

    // Test 2: Check database structure
    checkDatabaseStructure();

    // Test 3: Simulate algorithm impact
    simulateMatchingImpact(userId, user.current_multiplier || 1);
  });
}

function checkDatabaseStructure() {
  const checkTables = `
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `;

  db.all(checkTables, [], (err, tables) => {
    if (err) {
      console.error('❌ Error checking tables:', err);
      return;
    }

    console.log('🗄️ DATABASE STRUCTURE:');
    tables.forEach((table) => {
      console.log(`   📋 ${table.name}`);
    });

    const hasStoreItems = tables.some((t) => t.name === 'store_items');
    const hasInventory = tables.some((t) => t.name === 'user_inventory');

    console.log('\n🛒 STORE SYSTEM STATUS:');
    console.log(
      `   store_items table: ${hasStoreItems ? '✅ EXISTS' : '❌ MISSING'}`,
    );
    console.log(
      `   user_inventory table: ${hasInventory ? '✅ EXISTS' : '❌ MISSING'}`,
    );

    if (!hasStoreItems || !hasInventory) {
      console.log('\n💡 EXPLANATION:');
      console.log('   Store tables are not in this database yet.');
      console.log('   Profile Boost functionality works through:');
      console.log('   • Backend services (SwipeEnhancementService)');
      console.log('   • In-memory user profile updates');
      console.log('   • Real-time WebSocket notifications');
      console.log('   • Frontend countdown timers\n');
    }
  });
}

function simulateMatchingImpact(userId, multiplier) {
  console.log('🎯 MATCHING ALGORITHM SIMULATION:');

  const baseVisibilityScore = 100;
  const boostedScore = baseVisibilityScore * multiplier;

  console.log(`   Base Visibility Score: ${baseVisibilityScore}`);
  console.log(`   Current Multiplier: ${multiplier}x`);
  console.log(`   Boosted Score: ${boostedScore}`);

  if (multiplier > 1) {
    console.log(
      `   🚀 BOOST DETECTED! User ${userId} has ${multiplier}x visibility!`,
    );
    console.log(
      `   👑 Priority Level: ${multiplier >= 10 ? 'MAXIMUM' : multiplier >= 5 ? 'HIGH' : 'MEDIUM'}`,
    );
    console.log(`   📈 Expected Impact: ${multiplier}x more profile views`);
    console.log(
      `   🎯 Discovery Queue: TOP ${Math.ceil(5 / multiplier)} position`,
    );

    console.log('\n✅ BOOST IS WORKING IF:');
    console.log('   • profileBoost data exists in user record ✅');
    console.log('   • Multiplier > 1 ✅');
    console.log('   • Frontend shows active countdown ⏳');
    console.log('   • Backend logs show boost activation 📝');
    console.log('   • More matches/likes incoming 💕');
  } else {
    console.log(`   📊 Normal visibility (no boost active)`);
    console.log('\n🔧 TO ACTIVATE BOOST:');
    console.log('   1. Go to Enterprise Store in frontend');
    console.log('   2. Purchase Profile Boost (1h) for 25 fuel');
    console.log('   3. Activate from inventory');
    console.log('   4. Run this script again to see impact');
  }

  console.log('');
  testRecentActivity(userId);
}

function testRecentActivity(userId) {
  // Check if swipes table exists
  const checkSwipesTable = `
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name = 'swipes'
  `;

  db.get(checkSwipesTable, [], (err, table) => {
    if (err || !table) {
      console.log('📊 ACTIVITY CHECK: Swipes table not available');
      console.log('   To test real impact, monitor:');
      console.log('   • Frontend discovery queue position');
      console.log('   • Backend server logs for boost messages');
      console.log('   • Network tab for boost API calls');
      console.log('   • Real user feedback from discovery\n');

      finalAssessment(userId);
      return;
    }

    // If table exists, check recent swipes
    const recentSwipes = `
      SELECT 
        COUNT(*) as total_swipes,
        SUM(CASE WHEN direction = 'right' THEN 1 ELSE 0 END) as likes_received,
        SUM(CASE WHEN direction = 'left' THEN 1 ELSE 0 END) as passes_received
      FROM swipes 
      WHERE targetUserId = ? 
        AND createdAt > datetime('now', '-1 hour')
    `;

    db.get(recentSwipes, [userId], (err, swipeData) => {
      if (err) {
        console.error('❌ Error checking swipes:', err);
        finalAssessment(userId);
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
          console.log(`   🔥 HIGH activity - Boost might be working!`);
        } else if (likeRate > 30) {
          console.log(`   📈 MODERATE activity`);
        } else {
          console.log(`   📊 LOW activity`);
        }
      }
      console.log('');

      finalAssessment(userId);
    });
  });
}

function finalAssessment(userId) {
  console.log('🎯 BOOST VERIFICATION CHECKLIST:');
  console.log('');
  console.log('✅ TECHNICAL CHECKS:');
  console.log('   □ User has profileBoost data in database');
  console.log('   □ Multiplier is greater than 1');
  console.log('   □ Boost expiry time is in the future');
  console.log('   □ Frontend countdown timer is active');
  console.log('');
  console.log('🧪 REAL-WORLD VERIFICATION:');
  console.log('   □ Have a friend check discovery queue');
  console.log('   □ Monitor increased profile views');
  console.log('   □ Compare match rate before/after');
  console.log('   □ Check backend logs for boost messages');
  console.log('');
  console.log('📱 LIVE TESTING (Open frontend http://localhost:5173):');
  console.log('   1. Go to Enterprise Store');
  console.log('   2. Buy Profile Boost (1h) - 25 fuel');
  console.log('   3. Activate from inventory');
  console.log('   4. Watch countdown timer start');
  console.log('   5. Open Network tab - look for boost API calls');
  console.log('   6. Run this script again to verify database impact');
  console.log('');
  console.log(
    '🚀 SUCCESS = Active boost + Real-time countdown + More matches! 🎯',
  );
  console.log('');

  db.close();
}

// Test for specific user ID (change this to test different users)
const testUserId = process.argv[2] || 1;
console.log(`🧪 Starting boost impact verification for User ID: ${testUserId}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

testBoostImpact(parseInt(testUserId));
