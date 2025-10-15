const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Insert the real money items that failed
const realMoneyItems = [
  {
    id: 17,
    itemId: 'fuel-mega-pack',
    name: 'Fuel Mega Pack',
    description: 'Massive fuel bundle! 2000 Fuel points for the best value.',
    icon: '🔥',
    price: 0, // Set to 0 for real money items
    currency: 'usd',
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
    price: 0,
    currency: 'usd',
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
    price: 0,
    currency: 'usd',
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
];

console.log('💰 Adding Real Money Items...');

const insertPromises = realMoneyItems.map((item) => {
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
        console.log(`✅ Added: ${item.name} ($${item.realMoneyCost})`);
        resolve();
      }
    });
  });
});

Promise.all(insertPromises)
  .then(() => {
    console.log('\n🎉 Real Money Items Added Successfully!');
    console.log('\n📊 Final Store Summary:');

    // Get final count
    db.all('SELECT COUNT(*) as total FROM store_items', (err, result) => {
      if (!err) {
        console.log(`🛍️ Total Store Items: ${result[0].total}`);
      }

      db.all(
        'SELECT currency, COUNT(*) as count FROM store_items GROUP BY currency',
        (err, results) => {
          if (!err) {
            results.forEach((r) =>
              console.log(`${r.currency}: ${r.count} items`),
            );
          }
          db.close();
        },
      );
    });
  })
  .catch((err) => {
    console.error('❌ Failed to add real money items:', err);
    db.close();
  });
