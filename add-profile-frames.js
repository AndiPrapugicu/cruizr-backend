const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Adding new Profile Frame system...');

// Profile Frames pentru Fuel Points (50-300 fuel)
const fuelFrames = [
  // Basic Color Frames (50 fuel)
  {
    itemId: 'profile_frame_basic_blue',
    name: 'Blue Profile Frame',
    description:
      'A simple, elegant blue frame for your profile. Classic and affordable!',
    icon: '🔵',
    price: 50,
    currency: 'fuel',
    category: 'customization',
    subcategory: 'profile_frame',
    type: 'profile_frame',
    duration: null,
    maxUses: null,
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    features: JSON.stringify([
      'Blue border effect',
      'Permanent unlock',
      'Classic style',
    ]),
    requirements: JSON.stringify({}),
    effects: JSON.stringify({ frame: 'blue_basic' }),
    metadata: JSON.stringify({ tier: 'basic', color: 'blue' }),
  },
  {
    itemId: 'profile_frame_basic_green',
    name: 'Green Profile Frame',
    description:
      'A fresh green frame for your profile. Show your natural side!',
    icon: '🟢',
    price: 50,
    currency: 'fuel',
    category: 'customization',
    subcategory: 'profile_frame',
    type: 'profile_frame',
    duration: null,
    maxUses: null,
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    features: JSON.stringify([
      'Green border effect',
      'Permanent unlock',
      'Nature-inspired',
    ]),
    requirements: JSON.stringify({}),
    effects: JSON.stringify({ frame: 'green_basic' }),
    metadata: JSON.stringify({ tier: 'basic', color: 'green' }),
  },
  {
    itemId: 'profile_frame_basic_yellow',
    name: 'Yellow Profile Frame',
    description: 'A bright yellow frame for your profile. Spread positivity!',
    icon: '🟡',
    price: 50,
    currency: 'fuel',
    category: 'customization',
    subcategory: 'profile_frame',
    type: 'profile_frame',
    duration: null,
    maxUses: null,
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    features: JSON.stringify([
      'Yellow border effect',
      'Permanent unlock',
      'Cheerful design',
    ]),
    requirements: JSON.stringify({}),
    effects: JSON.stringify({ frame: 'yellow_basic' }),
    metadata: JSON.stringify({ tier: 'basic', color: 'yellow' }),
  },
  {
    itemId: 'profile_frame_basic_red',
    name: 'Red Profile Frame',
    description:
      'A bold red frame for your profile. Show your passionate side!',
    icon: '🔴',
    price: 50,
    currency: 'fuel',
    category: 'customization',
    subcategory: 'profile_frame',
    type: 'profile_frame',
    duration: null,
    maxUses: null,
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    features: JSON.stringify([
      'Red border effect',
      'Permanent unlock',
      'Bold statement',
    ]),
    requirements: JSON.stringify({}),
    effects: JSON.stringify({ frame: 'red_basic' }),
    metadata: JSON.stringify({ tier: 'basic', color: 'red' }),
  },

  // Emerald Tier (120 fuel)
  {
    itemId: 'profile_frame_emerald',
    name: 'Emerald Profile Frame',
    description:
      'A luxurious emerald frame with subtle gem effects. Premium style for fuel points!',
    icon: '💚',
    price: 120,
    currency: 'fuel',
    category: 'customization',
    subcategory: 'profile_frame',
    type: 'profile_frame',
    duration: null,
    maxUses: null,
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    features: JSON.stringify([
      'Emerald gem effects',
      'Subtle glow',
      'Premium tier',
      'Permanent unlock',
    ]),
    requirements: JSON.stringify({}),
    effects: JSON.stringify({ frame: 'emerald_tier', glow: true }),
    metadata: JSON.stringify({ tier: 'emerald', rarity: 'rare' }),
  },

  // Platinum Tier (180 fuel)
  {
    itemId: 'profile_frame_platinum',
    name: 'Platinum Profile Frame',
    description:
      'A sleek platinum frame with metallic shine. Elite status for dedicated users!',
    icon: '⚪',
    price: 180,
    currency: 'fuel',
    category: 'customization',
    subcategory: 'profile_frame',
    type: 'profile_frame',
    duration: null,
    maxUses: null,
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    features: JSON.stringify([
      'Platinum metallic effect',
      'Elegant shine',
      'Elite tier',
      'Permanent unlock',
    ]),
    requirements: JSON.stringify({}),
    effects: JSON.stringify({ frame: 'platinum_tier', metallic: true }),
    metadata: JSON.stringify({ tier: 'platinum', rarity: 'epic' }),
  },

  // Legendary Tier (300 fuel)
  {
    itemId: 'profile_frame_legendary_phoenix',
    name: 'Phoenix Legendary Frame',
    description:
      'An epic phoenix frame with animated fire effects. Rise from the ashes in style!',
    icon: '🔥',
    price: 300,
    currency: 'fuel',
    category: 'customization',
    subcategory: 'profile_frame',
    type: 'profile_frame',
    duration: null,
    maxUses: null,
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    features: JSON.stringify([
      'Animated fire effects',
      'Phoenix theme',
      'Legendary tier',
      'Exclusive design',
    ]),
    requirements: JSON.stringify({}),
    effects: JSON.stringify({
      frame: 'phoenix_legendary',
      animated: true,
      theme: 'fire',
    }),
    metadata: JSON.stringify({ tier: 'legendary', rarity: 'legendary' }),
  },
];

// Premium Frames (pentru premium points) - special ones
const premiumFrames = [
  {
    itemId: 'profile_frame_premium_mystic',
    name: 'Mystic Premium Frame',
    description:
      'An otherworldly frame with mystical energy effects. Only for premium users!',
    icon: '🔮',
    price: 15,
    currency: 'premium',
    category: 'customization',
    subcategory: 'profile_frame',
    type: 'profile_frame',
    duration: null,
    maxUses: null,
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    features: JSON.stringify([
      'Mystical energy effects',
      'Premium exclusive',
      'Animated particles',
      'Ultimate prestige',
    ]),
    requirements: JSON.stringify({}),
    effects: JSON.stringify({
      frame: 'mystic_premium',
      particles: true,
      energy: true,
    }),
    metadata: JSON.stringify({ tier: 'premium', rarity: 'mythic' }),
  },
  {
    itemId: 'profile_frame_premium_cosmic',
    name: 'Cosmic Premium Frame',
    description:
      'A cosmic frame with swirling galaxy effects. Reach for the stars!',
    icon: '🌌',
    price: 20,
    currency: 'premium',
    category: 'customization',
    subcategory: 'profile_frame',
    type: 'profile_frame',
    duration: null,
    maxUses: null,
    isActive: true,
    isPermanent: true,
    isLimited: false,
    limitedQuantity: null,
    features: JSON.stringify([
      'Galaxy effects',
      'Cosmic theme',
      'Premium exclusive',
      'Stellar animation',
    ]),
    requirements: JSON.stringify({}),
    effects: JSON.stringify({
      frame: 'cosmic_premium',
      galaxy: true,
      stars: true,
    }),
    metadata: JSON.stringify({ tier: 'premium', rarity: 'mythic' }),
  },
];

// Insert fuel frames
const insertFuelFrame = db.prepare(`
  INSERT INTO store_items (
    itemId, name, description, icon, price, currency, category, subcategory, 
    duration, maxUses, isActive, isPermanent, isLimited, limitedQuantity,
    requirements, effects, metadata, createdAt, updatedAt, type, features
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)
`);

// Insert premium frames
const insertPremiumFrame = db.prepare(`
  INSERT INTO store_items (
    itemId, name, description, icon, price, currency, category, subcategory, 
    duration, maxUses, isActive, isPermanent, isLimited, limitedQuantity,
    requirements, effects, metadata, createdAt, updatedAt, type, features
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)
`);

console.log('Adding fuel frames...');
fuelFrames.forEach((frame) => {
  try {
    insertFuelFrame.run(
      frame.itemId,
      frame.name,
      frame.description,
      frame.icon,
      frame.price,
      frame.currency,
      frame.category,
      frame.subcategory,
      frame.duration,
      frame.maxUses,
      frame.isActive,
      frame.isPermanent,
      frame.isLimited,
      frame.limitedQuantity,
      frame.requirements,
      frame.effects,
      frame.metadata,
      frame.type,
      frame.features,
    );
    console.log(`✓ Added: ${frame.name} (${frame.price} 🔥)`);
  } catch (error) {
    console.log(`⚠ Skipped: ${frame.name} (already exists)`);
  }
});

console.log('\nAdding premium frames...');
premiumFrames.forEach((frame) => {
  try {
    insertPremiumFrame.run(
      frame.itemId,
      frame.name,
      frame.description,
      frame.icon,
      frame.price,
      frame.currency,
      frame.category,
      frame.subcategory,
      frame.duration,
      frame.maxUses,
      frame.isActive,
      frame.isPermanent,
      frame.isLimited,
      frame.limitedQuantity,
      frame.requirements,
      frame.effects,
      frame.metadata,
      frame.type,
      frame.features,
    );
    console.log(`✓ Added: ${frame.name} (${frame.price} 💎)`);
  } catch (error) {
    console.log(`⚠ Skipped: ${frame.name} (already exists)`);
  }
});

console.log('\n=== FINAL PROFILE FRAMES LIST ===');
db.all(
  "SELECT name, currency, price, description FROM store_items WHERE (name LIKE '%frame%' OR name LIKE '%Frame%') ORDER BY currency, price",
  (err, items) => {
    if (err) {
      console.error('Error querying final items:', err);
      return;
    }

    console.log('\nFuel Frames:');
    items
      .filter((i) => i.currency === 'fuel')
      .forEach((item) => {
        console.log(`- ${item.name} (${item.price} 🔥)`);
      });

    console.log('\nPremium Frames:');
    items
      .filter((i) => i.currency === 'premium')
      .forEach((item) => {
        console.log(`- ${item.name} (${item.price} 💎)`);
      });

    console.log(`\nTotal frames: ${items.length}`);
    console.log(
      `Fuel frames: ${items.filter((i) => i.currency === 'fuel').length}`,
    );
    console.log(
      `Premium frames: ${items.filter((i) => i.currency === 'premium').length}`,
    );

    db.close();
  },
);
