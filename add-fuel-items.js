const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Adding more fuel items to balance the store...');

const additionalFuelItems = [
  // Profile Frames for Fuel (cheaper variants)
  {
    itemId: 'silver-profile-frame',
    name: 'Silver Profile Frame',
    description:
      'A sleek silver frame to highlight your profile. Shows you have style!',
    icon: '🥈',
    price: 150,
    currency: 'fuel',
    category: 'customization',
    subcategory: 'frames',
    duration: null,
    maxUses: null,
    isPermanent: true,
    effects: JSON.stringify({
      type: 'profile_frame',
      style: 'silver',
      rarity: 'common',
    }),
    metadata: JSON.stringify({ rarity: 'common', frameColor: '#C0C0C0' }),
  },
  {
    itemId: 'bronze-profile-frame',
    name: 'Bronze Profile Frame',
    description:
      'A classic bronze frame for your profile. Perfect for standing out!',
    icon: '🥉',
    price: 80,
    currency: 'fuel',
    category: 'customization',
    subcategory: 'frames',
    duration: null,
    maxUses: null,
    isPermanent: true,
    effects: JSON.stringify({
      type: 'profile_frame',
      style: 'bronze',
      rarity: 'common',
    }),
    metadata: JSON.stringify({ rarity: 'common', frameColor: '#CD7F32' }),
  },
  {
    itemId: 'fire-profile-frame',
    name: 'Fire Profile Frame',
    description: 'A hot fire frame that shows your burning passion! 🔥',
    icon: '🔥',
    price: 200,
    currency: 'fuel',
    category: 'customization',
    subcategory: 'frames',
    duration: null,
    maxUses: null,
    isPermanent: true,
    effects: JSON.stringify({
      type: 'profile_frame',
      style: 'fire',
      rarity: 'uncommon',
    }),
    metadata: JSON.stringify({
      rarity: 'uncommon',
      frameColor: '#FF4500',
      animated: true,
    }),
  },

  // Messaging Features for Fuel
  {
    itemId: 'read-receipts-1day',
    name: 'Read Receipts (24h)',
    description:
      'See when your messages are read for 24 hours. Perfect for important conversations!',
    icon: '✓',
    price: 35,
    currency: 'fuel',
    category: 'messaging',
    subcategory: 'communication',
    duration: 24,
    maxUses: null,
    isPermanent: false,
    effects: JSON.stringify({ type: 'read_receipts', duration: 24 }),
    metadata: JSON.stringify({ rarity: 'common' }),
  },

  // Discovery Features for Fuel
  {
    itemId: 'see-who-liked-1h',
    name: 'See Who Liked You (1h)',
    description:
      'Peek at who liked your profile for 1 hour. Quick dating boost!',
    icon: '👀',
    price: 45,
    currency: 'fuel',
    category: 'discovery',
    subcategory: 'insight',
    duration: 1,
    maxUses: null,
    isPermanent: false,
    effects: JSON.stringify({ type: 'see_likes', duration: 1 }),
    metadata: JSON.stringify({ rarity: 'common' }),
  },

  // Location Features for Fuel
  {
    itemId: 'passport-travel-1day',
    name: 'Passport Travel (24h)',
    description:
      'Travel anywhere in the world for 24 hours. Explore global connections!',
    icon: '✈️',
    price: 50,
    currency: 'fuel',
    category: 'location',
    subcategory: 'travel',
    duration: 24,
    maxUses: null,
    isPermanent: false,
    effects: JSON.stringify({ type: 'location_change', duration: 24 }),
    metadata: JSON.stringify({ rarity: 'common' }),
  },

  // Swipe Features for Fuel
  {
    itemId: 'unlimited-swipes-1h',
    name: 'Unlimited Swipes (1h)',
    description: 'Swipe without limits for 1 hour. Perfect for quick sessions!',
    icon: '∞',
    price: 25,
    currency: 'fuel',
    category: 'matching',
    subcategory: 'tools',
    duration: 1,
    maxUses: null,
    isPermanent: false,
    effects: JSON.stringify({ type: 'unlimited_swipes', duration: 1 }),
    metadata: JSON.stringify({ rarity: 'common' }),
  },
  {
    itemId: 'unlimited-swipes-6h',
    name: 'Unlimited Swipes (6h)',
    description: 'Swipe without limits for 6 hours. Extended dating session!',
    icon: '∞',
    price: 100,
    currency: 'fuel',
    category: 'matching',
    subcategory: 'tools',
    duration: 6,
    maxUses: null,
    isPermanent: false,
    effects: JSON.stringify({ type: 'unlimited_swipes', duration: 6 }),
    metadata: JSON.stringify({ rarity: 'uncommon' }),
  },

  // Super Likes with different quantities
  {
    itemId: 'super-like-3pack',
    name: 'Super Like (3-Pack)',
    description: 'Bundle of 3 super likes. Show your interest with impact!',
    icon: '⭐',
    price: 45,
    currency: 'fuel',
    category: 'likes',
    subcategory: 'engagement',
    duration: null,
    maxUses: 3,
    isPermanent: false,
    effects: JSON.stringify({ type: 'super_like', count: 3 }),
    metadata: JSON.stringify({ rarity: 'common' }),
  },
  {
    itemId: 'super-like-10pack',
    name: 'Super Like (10-Pack)',
    description: 'Bundle of 10 super likes. For those who know what they want!',
    icon: '⭐',
    price: 140,
    currency: 'fuel',
    category: 'likes',
    subcategory: 'engagement',
    duration: null,
    maxUses: 10,
    isPermanent: false,
    effects: JSON.stringify({ type: 'super_like', count: 10 }),
    metadata: JSON.stringify({ rarity: 'uncommon' }),
  },
];

// Insert each item
let completed = 0;
const total = additionalFuelItems.length;

additionalFuelItems.forEach((item, index) => {
  const stmt = db.prepare(`
    INSERT INTO store_items (
      itemId, name, description, icon, price, currency, category, subcategory,
      duration, maxUses, isActive, isPermanent, isLimited, limitedQuantity,
      requirements, effects, metadata, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  stmt.run(
    [
      item.itemId,
      item.name,
      item.description,
      item.icon,
      item.price,
      item.currency,
      item.category,
      item.subcategory,
      item.duration,
      item.maxUses,
      1,
      item.isPermanent ? 1 : 0,
      0,
      null,
      null,
      item.effects,
      item.metadata,
    ],
    function (err) {
      if (err) {
        console.error(`Error inserting ${item.name}:`, err.message);
      } else {
        console.log(`✅ Added: ${item.name} (${item.price} ${item.currency})`);
      }

      completed++;
      if (completed === total) {
        console.log(`\n🎉 Successfully added ${total} new fuel items!`);
        console.log(
          'Now we have much better balance between fuel and premium items.',
        );
        db.close();
      }
    },
  );

  stmt.finalize();
});
