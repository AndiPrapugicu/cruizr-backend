const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Add missing columns to store_items table
const alterTableQueries = [
  `ALTER TABLE store_items ADD COLUMN type varchar DEFAULT 'item'`,
  `ALTER TABLE store_items ADD COLUMN features TEXT DEFAULT NULL`,
  `ALTER TABLE store_items ADD COLUMN realMoneyCost DECIMAL(10,2) DEFAULT NULL`,
];

console.log('🔧 Updating store_items table structure...');

const runQueries = async () => {
  for (const query of alterTableQueries) {
    try {
      await new Promise((resolve, reject) => {
        db.run(query, (err) => {
          if (err) {
            if (err.message.includes('duplicate column name')) {
              console.log(
                `⚠️ Column already exists: ${query.split('ADD COLUMN ')[1]?.split(' ')[0]}`,
              );
              resolve();
            } else {
              reject(err);
            }
          } else {
            console.log(
              `✅ Added column: ${query.split('ADD COLUMN ')[1]?.split(' ')[0]}`,
            );
            resolve();
          }
        });
      });
    } catch (err) {
      console.error(`❌ Error with query: ${query}`, err);
    }
  }

  console.log('\n🎯 Table structure updated! Now inserting store items...\n');

  // Clear existing items first
  db.run('DELETE FROM store_items', (err) => {
    if (err) {
      console.error('Error clearing store items:', err);
      return;
    }
    console.log('🗑️ Cleared existing store items');
    insertStoreItems();
  });
};

// Enterprise Store Items - Properly Priced & Fully Functional
const enterpriseStoreItems = [
  // ========== FUEL ITEMS (🔥) ==========

  // BASIC BOOSTS
  {
    id: 1,
    itemId: 'profile-boost-1h',
    name: 'Profile Boost (1h)',
    description:
      'Boost your profile to 10x more visibility for 1 hour. Be seen by more potential matches!',
    icon: '🚀',
    price: 25,
    currency: 'fuel',
    category: 'boosts',
    type: 'boost',
    subcategory: 'visibility',
    duration: 1,
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'visibility', multiplier: 10 }),
    metadata: JSON.stringify({ rarity: 'common' }),
    features:
      '["10x Profile Visibility", "Priority in Discovery", "Instant Effect"]',
    realMoneyCost: null,
  },
  {
    id: 2,
    itemId: 'profile-boost-6h',
    name: 'Profile Boost (6h)',
    description:
      'Extended profile boost for 6 hours. Perfect for evening dating sessions!',
    icon: '🚀',
    price: 120,
    currency: 'fuel',
    category: 'boosts',
    type: 'boost',
    subcategory: 'visibility',
    duration: 6,
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'visibility', multiplier: 10 }),
    metadata: JSON.stringify({ rarity: 'uncommon' }),
    features:
      '["10x Profile Visibility", "Priority in Discovery", "6 Hour Duration", "Better Value"]',
    realMoneyCost: null,
  },
  {
    id: 3,
    itemId: 'super-boost-24h',
    name: 'Super Boost (24h)',
    description:
      'Maximum profile boost for 24 hours. Dominate the discovery queue all day!',
    icon: '⚡',
    price: 400,
    currency: 'fuel',
    category: 'boosts',
    type: 'boost',
    subcategory: 'visibility',
    duration: 24,
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'visibility', multiplier: 15 }),
    metadata: JSON.stringify({ rarity: 'rare' }),
    features:
      '["15x Profile Visibility", "Top Priority Discovery", "24 Hour Duration", "Maximum Exposure"]',
    realMoneyCost: null,
  },

  // REWIND TOOLS
  {
    id: 4,
    itemId: 'swipe-rewind-single',
    name: 'Swipe Rewind',
    description:
      'Undo your last swipe. Changed your mind? Get a second chance!',
    icon: '↶',
    price: 15,
    currency: 'fuel',
    category: 'tools',
    type: 'rewind',
    subcategory: 'utility',
    duration: null,
    maxUses: 1,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'rewind', count: 1 }),
    metadata: JSON.stringify({ rarity: 'common' }),
    features: '["Undo Last Swipe", "Instant Effect", "Single Use"]',
    realMoneyCost: null,
  },
  {
    id: 5,
    itemId: 'swipe-rewind-5pack',
    name: 'Swipe Rewind (5-Pack)',
    description: 'Bundle of 5 swipe rewinds. Better value for active users!',
    icon: '↶',
    price: 60,
    currency: 'fuel',
    category: 'tools',
    type: 'rewind',
    subcategory: 'utility',
    duration: null,
    maxUses: 5,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'rewind', count: 5 }),
    metadata: JSON.stringify({ rarity: 'uncommon' }),
    features: '["5 Swipe Rewinds", "Bulk Value", "Save 15 Fuel"]',
    realMoneyCost: null,
  },

  // SUPER LIKES
  {
    id: 6,
    itemId: 'super-like-single',
    name: 'Super Like',
    description:
      'Show someone you really like them! Get noticed instantly with a super like.',
    icon: '⭐',
    price: 20,
    currency: 'fuel',
    category: 'likes',
    type: 'super_like',
    subcategory: 'engagement',
    duration: null,
    maxUses: 1,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'super_like', count: 1 }),
    metadata: JSON.stringify({ rarity: 'common' }),
    features:
      '["Instant Notification", "Priority Message", "Higher Match Rate"]',
    realMoneyCost: null,
  },
  {
    id: 7,
    itemId: 'super-like-5pack',
    name: 'Super Like (5-Pack)',
    description:
      'Bundle of 5 super likes. Show appreciation to multiple matches!',
    icon: '⭐',
    price: 80,
    currency: 'fuel',
    category: 'likes',
    type: 'super_like',
    subcategory: 'engagement',
    duration: null,
    maxUses: 5,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'super_like', count: 5 }),
    metadata: JSON.stringify({ rarity: 'uncommon' }),
    features: '["5 Super Likes", "Bulk Value", "Save 20 Fuel"]',
    realMoneyCost: null,
  },

  // ========== PREMIUM ITEMS (💎) ==========

  // PREMIUM MEMBERSHIP - NOW PERMANENT!
  {
    id: 8,
    itemId: 'premium-membership-permanent',
    name: 'Premium Membership (Permanent)',
    description:
      'Unlock ALL premium features forever! Includes unlimited swipes, super likes, boosts and exclusive content.',
    icon: '💎',
    price: 50,
    currency: 'premium',
    category: 'membership',
    type: 'membership',
    subcategory: 'premium',
    duration: null,
    maxUses: null,
    isActive: 1,
    isPermanent: 1, // This is permanent now!
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({
      type: 'membership',
      includes: [
        'unlimited_swipes',
        'super_likes',
        'boosts',
        'read_receipts',
        'who_liked_me',
        'passport',
      ],
    }),
    metadata: JSON.stringify({ rarity: 'legendary' }),
    features:
      '["Unlimited Swipes (Forever)", "Unlimited Super Likes", "Free Daily Boosts", "See Who Liked You", "Read Receipts", "Passport (Change Location)", "Priority Support", "Exclusive Profile Frames"]',
    realMoneyCost: null,
  },

  // VIP STATUS - PREMIUM UPGRADE
  {
    id: 9,
    itemId: 'vip-status-permanent',
    name: 'VIP Status (Permanent)',
    description:
      'Elite VIP status with exclusive perks and early access to new features!',
    icon: '👑',
    price: 100,
    currency: 'premium',
    category: 'membership',
    type: 'membership',
    subcategory: 'vip',
    duration: null,
    maxUses: null,
    isActive: 1,
    isPermanent: 1,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({
      type: 'vip',
      includes: [
        'all_premium_features',
        'exclusive_content',
        'priority_support',
        'beta_features',
      ],
    }),
    metadata: JSON.stringify({ rarity: 'legendary' }),
    features:
      '["All Premium Features", "Exclusive VIP Badge", "Priority Customer Support", "Early Access to New Features", "Exclusive Profile Themes", "VIP-Only Events", "Custom Profile Effects"]',
    realMoneyCost: null,
  },

  // UNLIMITED SWIPES (24H) - For non-premium users
  {
    id: 10,
    itemId: 'unlimited-swipes-24h',
    name: 'Unlimited Swipes (24h)',
    description:
      'Get unlimited swipes for 24 hours. Perfect for discovering new matches!',
    icon: '∞',
    price: 4, // As requested - 4 diamonds for 24h
    currency: 'premium',
    category: 'matching',
    type: 'unlimited_swipes',
    subcategory: 'tools',
    duration: 24,
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'unlimited_swipes', duration: 24 }),
    metadata: JSON.stringify({ rarity: 'uncommon' }),
    features: '["Unlimited Swipes", "24 Hour Duration", "No Daily Limit"]',
    realMoneyCost: null,
  },

  // ADVANCED TOOLS
  {
    id: 11,
    itemId: 'see-who-liked-24h',
    name: 'See Who Liked You (24h)',
    description:
      'See who liked your profile for 24 hours. Know who is interested!',
    icon: '👀',
    price: 6,
    currency: 'premium',
    category: 'discovery',
    type: 'who_liked_me',
    subcategory: 'insight',
    duration: 24,
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'who_liked_me', duration: 24 }),
    metadata: JSON.stringify({ rarity: 'rare' }),
    features: '["See All Likes", "Profile Photos", "24 Hour Access"]',
    realMoneyCost: null,
  },

  {
    id: 12,
    itemId: 'read-receipts-7days',
    name: 'Read Receipts (7 days)',
    description:
      'Know when your messages are read for 7 days. Improve your conversation game!',
    icon: '✓✓',
    price: 8,
    currency: 'premium',
    category: 'messaging',
    type: 'read_receipts',
    subcategory: 'communication',
    duration: 168, // 7 days
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'read_receipts', duration: 168 }),
    metadata: JSON.stringify({ rarity: 'rare' }),
    features: '["Message Read Status", "Typing Indicators", "7 Day Duration"]',
    realMoneyCost: null,
  },

  {
    id: 13,
    itemId: 'passport-travel-30days',
    name: 'Passport Travel (30 days)',
    description:
      'Change your location to anywhere in the world for 30 days. Meet people globally!',
    icon: '🌍',
    price: 15,
    currency: 'premium',
    category: 'location',
    type: 'passport',
    subcategory: 'travel',
    duration: 720, // 30 days
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'location_change', duration: 720 }),
    metadata: JSON.stringify({ rarity: 'epic' }),
    features:
      '["Change Location Worldwide", "30 Day Duration", "Unlimited Location Changes"]',
    realMoneyCost: null,
  },

  // ========== PROFILE FRAMES & CUSTOMIZATION ==========

  {
    id: 14,
    itemId: 'gold-profile-frame',
    name: 'Gold Profile Frame',
    description:
      'Elegant golden frame for your profile. Stand out with premium style!',
    icon: '🟨',
    price: 12,
    currency: 'premium',
    category: 'customization',
    type: 'profile_frame',
    subcategory: 'frames',
    duration: null,
    maxUses: null,
    isActive: 1,
    isPermanent: 1, // Profile frames are permanent
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'profile_frame', style: 'gold' }),
    metadata: JSON.stringify({ rarity: 'epic' }),
    features: '["Golden Frame Border", "Permanent Unlock", "Premium Look"]',
    realMoneyCost: null,
  },

  {
    id: 15,
    itemId: 'diamond-profile-frame',
    name: 'Diamond Profile Frame',
    description:
      'Ultra-exclusive diamond frame. The ultimate flex for VIP users!',
    icon: '💎',
    price: 25,
    currency: 'premium',
    category: 'customization',
    type: 'profile_frame',
    subcategory: 'frames',
    duration: null,
    maxUses: null,
    isActive: 1,
    isPermanent: 1,
    isLimited: 1,
    limitedQuantity: 100, // Limited edition
    requirements: null,
    effects: JSON.stringify({ type: 'profile_frame', style: 'diamond' }),
    metadata: JSON.stringify({ rarity: 'legendary' }),
    features:
      '["Diamond Frame Border", "Limited Edition", "VIP Exclusive", "Animated Effects"]',
    realMoneyCost: null,
  },

  {
    id: 16,
    itemId: 'rainbow-profile-frame',
    name: 'Rainbow Profile Frame',
    description:
      'Colorful animated rainbow frame. Show your vibrant personality!',
    icon: '🌈',
    price: 18,
    currency: 'premium',
    category: 'customization',
    type: 'profile_frame',
    subcategory: 'frames',
    duration: null,
    maxUses: null,
    isActive: 1,
    isPermanent: 1,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({
      type: 'profile_frame',
      style: 'rainbow',
      animated: true,
    }),
    metadata: JSON.stringify({ rarity: 'epic' }),
    features:
      '["Animated Rainbow Colors", "Permanent Unlock", "Eye-catching Design"]',
    realMoneyCost: null,
  },

  // ========== SPECIAL OFFERS (Real Money) ==========

  {
    id: 17,
    itemId: 'fuel-mega-pack',
    name: 'Fuel Mega Pack',
    description: 'Massive fuel bundle! 2000 Fuel points for the best value.',
    icon: '🔥',
    price: null,
    currency: 'fuel',
    category: 'bundles',
    type: 'fuel_bundle',
    subcategory: 'currency',
    duration: null,
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'fuel', amount: 2000 }),
    metadata: JSON.stringify({ rarity: 'special' }),
    features: '["2000 Fuel Points", "Best Value", "Instant Delivery"]',
    realMoneyCost: 19.99,
  },

  {
    id: 18,
    itemId: 'premium-mega-pack',
    name: 'Premium Mega Pack',
    description:
      'Ultimate premium bundle! 500 Premium points plus exclusive bonuses.',
    icon: '💎',
    price: null,
    currency: 'premium',
    category: 'bundles',
    type: 'premium_bundle',
    subcategory: 'currency',
    duration: null,
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'premium', amount: 500 }),
    metadata: JSON.stringify({ rarity: 'special' }),
    features: '["500 Premium Points", "Exclusive Bonuses", "Instant Delivery"]',
    realMoneyCost: 49.99,
  },

  {
    id: 19,
    itemId: 'ultimate-starter-pack',
    name: 'Ultimate Starter Pack',
    description:
      'Everything you need to succeed! Premium membership + fuel + bonuses.',
    icon: '🎁',
    price: null,
    currency: 'premium',
    category: 'bundles',
    type: 'starter_pack',
    subcategory: 'special',
    duration: null,
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 1,
    limitedQuantity: 50,
    requirements: null,
    effects: JSON.stringify({
      type: 'bundle',
      includes: [
        'premium_membership',
        'fuel_1000',
        'premium_200',
        'profile_frames',
      ],
    }),
    metadata: JSON.stringify({ rarity: 'legendary' }),
    features:
      '["Permanent Premium Membership", "1000 Fuel Points", "200 Premium Points", "Exclusive Profile Frames", "VIP Welcome Bonus"]',
    realMoneyCost: 99.99,
  },

  // ========== SPECIAL BOOSTS & EFFECTS ==========

  {
    id: 20,
    itemId: 'spotlight-boost-1h',
    name: 'Spotlight Boost (1h)',
    description:
      'Be the featured profile for 1 hour. Maximum visibility guaranteed!',
    icon: '🔦',
    price: 200,
    currency: 'fuel',
    category: 'boosts',
    type: 'boost',
    subcategory: 'premium',
    duration: 1,
    maxUses: null,
    isActive: 1,
    isPermanent: 0,
    isLimited: 0,
    limitedQuantity: null,
    requirements: null,
    effects: JSON.stringify({ type: 'spotlight', multiplier: 50 }),
    metadata: JSON.stringify({ rarity: 'epic' }),
    features: '["Featured Profile Slot", "50x Visibility", "Guaranteed Views"]',
    realMoneyCost: null,
  },
];

function insertStoreItems() {
  console.log('🚀 Inserting Enterprise Store Items...\n');

  // Insert all items
  const insertPromises = enterpriseStoreItems.map((item) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO store_items (
        id, itemId, name, description, icon, price, currency, category, type, subcategory,
        duration, maxUses, isActive, isPermanent, isLimited, limitedQuantity, requirements,
        effects, metadata, features, realMoneyCost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        item.id,
        item.itemId,
        item.name,
        item.description,
        item.icon,
        item.price,
        item.currency,
        item.category,
        item.type,
        item.subcategory,
        item.duration,
        item.maxUses,
        item.isActive,
        item.isPermanent,
        item.isLimited,
        item.limitedQuantity,
        item.requirements,
        item.effects,
        item.metadata,
        item.features,
        item.realMoneyCost,
      ];

      db.run(sql, values, function (err) {
        if (err) {
          console.error(`❌ Error inserting ${item.name}:`, err);
          reject(err);
        } else {
          console.log(
            `✅ Added: ${item.name} (${item.currency}: ${item.price || '$' + item.realMoneyCost})`,
          );
          resolve();
        }
      });
    });
  });

  Promise.all(insertPromises)
    .then(() => {
      console.log('\n🎉 SUCCESS! Enterprise Store Updated!');
      console.log('📊 Total Items:', enterpriseStoreItems.length);
      console.log(
        '🔥 Fuel Items:',
        enterpriseStoreItems.filter((i) => i.currency === 'fuel').length,
      );
      console.log(
        '💎 Premium Items:',
        enterpriseStoreItems.filter((i) => i.currency === 'premium').length,
      );
      console.log(
        '💰 Real Money Items:',
        enterpriseStoreItems.filter((i) => i.realMoneyCost).length,
      );
      console.log(
        '👑 Permanent Items:',
        enterpriseStoreItems.filter((i) => i.isPermanent).length,
      );
      db.close();
    })
    .catch((err) => {
      console.error('❌ Failed to update store:', err);
      db.close();
    });
}

runQueries();
