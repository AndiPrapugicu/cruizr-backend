const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Clear existing items first
db.run('DELETE FROM store_items', (err) => {
  if (err) {
    console.error('Error clearing store items:', err);
    return;
  }
  console.log('🗑️ Cleared existing store items');
});

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
    price: 25, // Fair for 1 hour visibility
    currency: 'fuel',
    category: 'boosts',
    type: 'boost',
    subcategory: 'visibility',
    duration: 1,
    maxUses: null,
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'visibility', multiplier: 10 },
    metadata: { rarity: 'common' },
    features: JSON.stringify([
      '10x Profile Visibility',
      'Priority in Discovery',
      'Instant Effect',
    ]),
  },
  {
    id: 2,
    itemId: 'profile-boost-6h',
    name: 'Profile Boost (6h)',
    description:
      'Extended profile boost for 6 hours. Perfect for evening dating sessions!',
    icon: '🚀',
    price: 120, // Better value for longer duration
    currency: 'fuel',
    category: 'boosts',
    type: 'boost',
    subcategory: 'visibility',
    duration: 6,
    maxUses: null,
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'visibility', multiplier: 10 },
    metadata: { rarity: 'uncommon' },
    features: JSON.stringify([
      '10x Profile Visibility',
      'Priority in Discovery',
      '6 Hour Duration',
      'Better Value',
    ]),
  },
  {
    id: 3,
    itemId: 'super-boost-24h',
    name: 'Super Boost (24h)',
    description:
      'Maximum profile boost for 24 hours. Dominate the discovery queue all day!',
    icon: '⚡',
    price: 400, // Premium pricing for 24h
    currency: 'fuel',
    category: 'boosts',
    type: 'boost',
    subcategory: 'visibility',
    duration: 24,
    maxUses: null,
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'visibility', multiplier: 15 },
    metadata: { rarity: 'rare' },
    features: JSON.stringify([
      '15x Profile Visibility',
      'Top Priority Discovery',
      '24 Hour Duration',
      'Maximum Exposure',
    ]),
  },

  // REWIND TOOLS
  {
    id: 4,
    itemId: 'swipe-rewind-single',
    name: 'Swipe Rewind',
    description:
      'Undo your last swipe. Changed your mind? Get a second chance!',
    icon: '↶',
    price: 15, // Single use, moderate price
    currency: 'fuel',
    category: 'tools',
    type: 'rewind',
    subcategory: 'utility',
    duration: null,
    maxUses: 1,
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'rewind', count: 1 },
    metadata: { rarity: 'common' },
    features: JSON.stringify([
      'Undo Last Swipe',
      'Instant Effect',
      'Single Use',
    ]),
  },
  {
    id: 5,
    itemId: 'swipe-rewind-5pack',
    name: 'Swipe Rewind (5-Pack)',
    description: 'Bundle of 5 swipe rewinds. Better value for active users!',
    icon: '↶',
    price: 60, // Bulk discount
    currency: 'fuel',
    category: 'tools',
    type: 'rewind',
    subcategory: 'utility',
    duration: null,
    maxUses: 5,
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'rewind', count: 5 },
    metadata: { rarity: 'uncommon' },
    features: JSON.stringify(['5 Swipe Rewinds', 'Bulk Value', 'Save 15 Fuel']),
  },

  // SUPER LIKES
  {
    id: 6,
    itemId: 'super-like-single',
    name: 'Super Like',
    description:
      'Show someone you really like them! Get noticed instantly with a super like.',
    icon: '⭐',
    price: 20, // Single super like
    currency: 'fuel',
    category: 'likes',
    type: 'super_like',
    subcategory: 'engagement',
    duration: null,
    maxUses: 1,
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'super_like', count: 1 },
    metadata: { rarity: 'common' },
    features: JSON.stringify([
      'Instant Notification',
      'Priority Message',
      'Higher Match Rate',
    ]),
  },
  {
    id: 7,
    itemId: 'super-like-5pack',
    name: 'Super Like (5-Pack)',
    description:
      'Bundle of 5 super likes. Show appreciation to multiple matches!',
    icon: '⭐',
    price: 80, // Bulk pricing
    currency: 'fuel',
    category: 'likes',
    type: 'super_like',
    subcategory: 'engagement',
    duration: null,
    maxUses: 5,
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'super_like', count: 5 },
    metadata: { rarity: 'uncommon' },
    features: JSON.stringify(['5 Super Likes', 'Bulk Value', 'Save 20 Fuel']),
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
    price: 50, // Major investment for permanent access
    currency: 'premium',
    category: 'membership',
    type: 'membership',
    subcategory: 'premium',
    duration: null, // Permanent!
    maxUses: null,
    isActive: true,
    isPermanent: true, // This is permanent now!
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: {
      type: 'membership',
      includes: [
        'unlimited_swipes',
        'super_likes',
        'boosts',
        'read_receipts',
        'who_liked_me',
        'passport',
      ],
    },
    metadata: { rarity: 'legendary' },
    features: JSON.stringify([
      'Unlimited Swipes (Forever)',
      'Unlimited Super Likes',
      'Free Daily Boosts',
      'See Who Liked You',
      'Read Receipts',
      'Passport (Change Location)',
      'Priority Support',
      'Exclusive Profile Frames',
    ]),
  },

  // VIP STATUS - PREMIUM UPGRADE
  {
    id: 9,
    itemId: 'vip-status-permanent',
    name: 'VIP Status (Permanent)',
    description:
      'Elite VIP status with exclusive perks and early access to new features!',
    icon: '👑',
    price: 100, // Elite tier
    currency: 'premium',
    category: 'membership',
    type: 'membership',
    subcategory: 'vip',
    duration: null,
    maxUses: null,
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: {
      type: 'vip',
      includes: [
        'all_premium_features',
        'exclusive_content',
        'priority_support',
        'beta_features',
      ],
    },
    metadata: { rarity: 'legendary' },
    features: JSON.stringify([
      'All Premium Features',
      'Exclusive VIP Badge',
      'Priority Customer Support',
      'Early Access to New Features',
      'Exclusive Profile Themes',
      'VIP-Only Events',
      'Custom Profile Effects',
    ]),
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
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'unlimited_swipes', duration: 24 },
    metadata: { rarity: 'uncommon' },
    features: JSON.stringify([
      'Unlimited Swipes',
      '24 Hour Duration',
      'No Daily Limit',
    ]),
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
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'who_liked_me', duration: 24 },
    metadata: { rarity: 'rare' },
    features: JSON.stringify([
      'See All Likes',
      'Profile Photos',
      '24 Hour Access',
    ]),
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
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'read_receipts', duration: 168 },
    metadata: { rarity: 'rare' },
    features: JSON.stringify([
      'Message Read Status',
      'Typing Indicators',
      '7 Day Duration',
    ]),
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
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'location_change', duration: 720 },
    metadata: { rarity: 'epic' },
    features: JSON.stringify([
      'Change Location Worldwide',
      '30 Day Duration',
      'Unlimited Location Changes',
    ]),
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
    isActive: true,
    isPermanent: true, // Profile frames are permanent
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'profile_frame', style: 'gold' },
    metadata: { rarity: 'epic' },
    features: JSON.stringify([
      'Golden Frame Border',
      'Permanent Unlock',
      'Premium Look',
    ]),
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
    isActive: true,
    isPermanent: true,
    isLimited: true,
    limitedQuantity: 100, // Limited edition
    requirements: null,
    effects: { type: 'profile_frame', style: 'diamond' },
    metadata: { rarity: 'legendary' },
    features: JSON.stringify([
      'Diamond Frame Border',
      'Limited Edition',
      'VIP Exclusive',
      'Animated Effects',
    ]),
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
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'profile_frame', style: 'rainbow', animated: true },
    metadata: { rarity: 'epic' },
    features: JSON.stringify([
      'Animated Rainbow Colors',
      'Permanent Unlock',
      'Eye-catching Design',
    ]),
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
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'fuel', amount: 2000 },
    metadata: { rarity: 'special' },
    features: JSON.stringify([
      '2000 Fuel Points',
      'Best Value',
      'Instant Delivery',
    ]),
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
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'premium', amount: 500 },
    metadata: { rarity: 'special' },
    features: JSON.stringify([
      '500 Premium Points',
      'Exclusive Bonuses',
      'Instant Delivery',
    ]),
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
    isActive: true,
    isPermanent: false,
    isLimited: true,
    limitedQuantity: 50,
    requirements: null,
    effects: {
      type: 'bundle',
      includes: [
        'premium_membership',
        'fuel_1000',
        'premium_200',
        'profile_frames',
      ],
    },
    metadata: { rarity: 'legendary' },
    features: JSON.stringify([
      'Permanent Premium Membership',
      '1000 Fuel Points',
      '200 Premium Points',
      'Exclusive Profile Frames',
      'VIP Welcome Bonus',
    ]),
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
    isActive: true,
    isPermanent: false,
    isLimited: false,
    limitedQuantity: null,
    requirements: null,
    effects: { type: 'spotlight', multiplier: 50 },
    metadata: { rarity: 'epic' },
    features: JSON.stringify([
      'Featured Profile Slot',
      '50x Visibility',
      'Guaranteed Views',
    ]),
  },
];

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
      JSON.stringify(item.requirements),
      JSON.stringify(item.effects),
      JSON.stringify(item.metadata),
      item.features,
      item.realMoneyCost,
    ];

    db.run(sql, values, function (err) {
      if (err) {
        console.error(`❌ Error inserting ${item.name}:`, err);
        reject(err);
      } else {
        console.log(
          `✅ Added: ${item.name} (${item.currency}: ${item.price || item.realMoneyCost})`,
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
