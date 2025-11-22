import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function populateStore() {
  console.log('🏪 Populating Supabase Store...\n');

  const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to Supabase\n');

    // Clear existing items
    console.log('🗑️ Clearing existing store items...');
    await AppDataSource.query('DELETE FROM store_items');
    console.log('✅ Store cleared\n');

    console.log('📦 Inserting store items...\n');

    const items = [
      // 🔥 FUEL ITEMS - Visibility Boosts
      {
        itemId: 'spotlight-30min',
        name: 'Spotlight (30 min)',
        description: 'Be the first in local swipes for 30 minutes',
        icon: '🔦',
        price: 25,
        currency: 'fuel',
        category: 'visibility-boost',
        type: 'boost',
        subcategory: 'spotlight',
        duration: 1, // Use 1 hour instead of 0.5
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'visibility', multiplier: 10, priority: 'first', actualDuration: 30 },
        metadata: { rarity: 'epic', color: 'purple' },
      },
      {
        itemId: 'double-swipe-chance',
        name: 'Double Swipe Chance',
        description: 'Appear in swipes 2x more often for 24 hours',
        icon: '🔄',
        price: 50,
        currency: 'fuel',
        category: 'visibility-boost',
        type: 'boost',
        subcategory: 'frequency',
        duration: 24,
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'visibility', multiplier: 2 },
        metadata: { rarity: 'rare', color: 'blue' },
      },
      {
        itemId: 'prime-time-boost',
        name: 'Prime Time Boost (3h)',
        description: 'Maximum visibility during peak hours',
        icon: '⏰',
        price: 75,
        currency: 'fuel',
        category: 'visibility-boost',
        type: 'boost',
        subcategory: 'timed',
        duration: 3,
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'visibility', multiplier: 5, timeRestricted: true },
        metadata: { rarity: 'epic', color: 'orange' },
      },

      // 🔥 FUEL ITEMS - Super Likes
      {
        itemId: 'super-like-5',
        name: '5 Super Likes',
        description: 'Stand out with 5 Super Likes',
        icon: '⭐',
        price: 15,
        currency: 'fuel',
        category: 'power-up',
        type: 'super_like',
        subcategory: 'engagement',
        duration: null,
        maxUses: 5,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'matching' },
        metadata: { rarity: 'common', color: 'yellow' },
      },
      {
        itemId: 'super-like-10',
        name: '10 Super Likes',
        description: 'Stand out with 10 Super Likes',
        icon: '⭐',
        price: 25,
        currency: 'fuel',
        category: 'power-up',
        type: 'super_like',
        subcategory: 'engagement',
        duration: null,
        maxUses: 10,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'matching' },
        metadata: { rarity: 'common', color: 'yellow' },
      },
      {
        itemId: 'super-like-25',
        name: '25 Super Likes',
        description: 'Stand out with 25 Super Likes',
        icon: '⭐',
        price: 50,
        currency: 'fuel',
        category: 'power-up',
        type: 'super_like',
        subcategory: 'engagement',
        duration: null,
        maxUses: 25,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'matching' },
        metadata: { rarity: 'rare', color: 'yellow' },
      },

      // 🔥 FUEL ITEMS - Rewind
      {
        itemId: 'rewind-5',
        name: '5 Rewinds',
        description: 'Undo your last 5 swipes',
        icon: '↩️',
        price: 10,
        currency: 'fuel',
        category: 'power-up',
        type: 'rewind',
        subcategory: 'utility',
        duration: null,
        maxUses: 5,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'social' },
        metadata: { rarity: 'common', color: 'orange' },
      },
      {
        itemId: 'rewind-unlimited-24h',
        name: 'Unlimited Rewinds (24h)',
        description: 'Undo as many swipes as you want for 24 hours',
        icon: '↩️',
        price: 50,
        currency: 'fuel',
        category: 'power-up',
        type: 'rewind',
        subcategory: 'utility',
        duration: 24,
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'social' },
        metadata: { rarity: 'rare', color: 'orange' },
      },

      // 🔥 FUEL ITEMS - Message Boosts
      {
        itemId: 'priority-message',
        name: 'Priority Message',
        description: 'Your message appears at the top of their inbox',
        icon: '📨',
        price: 20,
        currency: 'fuel',
        category: 'communication',
        type: 'message_boost',
        subcategory: 'priority',
        duration: null,
        maxUses: 1,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'social', priority: 'high' },
        metadata: { rarity: 'rare', color: 'pink' },
      },

      // 💎 PREMIUM ITEMS - Subscriptions
      {
        itemId: 'premium-1-month',
        name: 'Premium (1 Month)',
        description: 'Unlock all premium features for 1 month',
        icon: '👑',
        price: 999,
        currency: 'premium',
        category: 'subscription',
        type: 'premium',
        subcategory: 'access',
        duration: 720, // 30 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'access' },
        metadata: { rarity: 'legendary', color: 'gold' },
      },
      {
        itemId: 'premium-3-months',
        name: 'Premium (3 Months)',
        description: 'Unlock all premium features for 3 months',
        icon: '👑',
        price: 2499,
        currency: 'premium',
        category: 'subscription',
        type: 'premium',
        subcategory: 'access',
        duration: 2160, // 90 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'access' },
        metadata: { rarity: 'legendary', color: 'gold' },
      },
      {
        itemId: 'premium-6-months',
        name: 'Premium (6 Months)',
        description: 'Unlock all premium features for 6 months',
        icon: '👑',
        price: 3999,
        currency: 'premium',
        category: 'subscription',
        type: 'premium',
        subcategory: 'access',
        duration: 4320, // 180 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'access' },
        metadata: { rarity: 'legendary', color: 'gold' },
      },

      // 💎 PREMIUM ITEMS - Features
      {
        itemId: 'see-likes-1-day',
        name: 'See Who Likes You (1 Day)',
        description: 'See everyone who has liked your profile for 24 hours',
        icon: '👀',
        price: 99,
        currency: 'premium',
        category: 'feature',
        type: 'see_likes',
        subcategory: 'access',
        duration: 24,
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'access' },
        metadata: { rarity: 'rare', color: 'pink' },
      },
      {
        itemId: 'see-likes-1-week',
        name: 'See Who Likes You (1 Week)',
        description: 'See everyone who has liked your profile for 7 days',
        icon: '👀',
        price: 299,
        currency: 'premium',
        category: 'feature',
        type: 'see_likes',
        subcategory: 'access',
        duration: 168, // 7 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'access' },
        metadata: { rarity: 'epic', color: 'pink' },
      },
      {
        itemId: 'unlimited-likes-1-day',
        name: 'Unlimited Likes (1 Day)',
        description: 'Swipe without limits for 24 hours',
        icon: '❤️',
        price: 49,
        currency: 'premium',
        category: 'feature',
        type: 'unlimited_likes',
        subcategory: 'engagement',
        duration: 24,
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'matching' },
        metadata: { rarity: 'common', color: 'red' },
      },
      {
        itemId: 'unlimited-likes-1-week',
        name: 'Unlimited Likes (1 Week)',
        description: 'Swipe without limits for 7 days',
        icon: '❤️',
        price: 199,
        currency: 'premium',
        category: 'feature',
        type: 'unlimited_likes',
        subcategory: 'engagement',
        duration: 168, // 7 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'matching' },
        metadata: { rarity: 'rare', color: 'red' },
      },

      // 💎 PREMIUM ITEMS - Profile Frames
      {
        itemId: 'frame-gold',
        name: 'Gold Profile Frame',
        description: 'Stand out with a luxurious gold frame',
        icon: '🖼️',
        price: 199,
        currency: 'premium',
        category: 'cosmetic',
        type: 'frame',
        subcategory: 'profile',
        duration: null,
        maxUses: null,
        isActive: true,
        isPermanent: true,
        isLimited: false,
        requirements: null,
        effects: { type: 'profile' },
        metadata: { rarity: 'epic', color: 'gold' },
      },
      {
        itemId: 'frame-rainbow',
        name: 'Rainbow Profile Frame',
        description: 'Show your personality with a vibrant rainbow frame',
        icon: '🌈',
        price: 149,
        currency: 'premium',
        category: 'cosmetic',
        type: 'frame',
        subcategory: 'profile',
        duration: null,
        maxUses: null,
        isActive: true,
        isPermanent: true,
        isLimited: false,
        requirements: null,
        effects: { type: 'profile' },
        metadata: { rarity: 'rare', color: 'rainbow' },
      },
      {
        itemId: 'frame-fire',
        name: 'Fire Profile Frame',
        description: 'Show you\'re on fire with an animated flame frame',
        icon: '🔥',
        price: 249,
        currency: 'premium',
        category: 'cosmetic',
        type: 'frame',
        subcategory: 'profile',
        duration: null,
        maxUses: null,
        isActive: true,
        isPermanent: true,
        isLimited: false,
        requirements: null,
        effects: { type: 'profile' },
        metadata: { rarity: 'epic', color: 'orange', animated: true },
      },

      // 💎 PREMIUM ITEMS - Travel Mode
      {
        itemId: 'travel-mode-3-days',
        name: 'Travel Mode (3 Days)',
        description: 'Match with people in any location for 3 days',
        icon: '✈️',
        price: 149,
        currency: 'premium',
        category: 'feature',
        type: 'travel',
        subcategory: 'location',
        duration: 72, // 3 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'access', feature: 'location_override' },
        metadata: { rarity: 'rare', color: 'blue' },
      },
      {
        itemId: 'travel-mode-1-week',
        name: 'Travel Mode (1 Week)',
        description: 'Match with people in any location for 7 days',
        icon: '✈️',
        price: 299,
        currency: 'premium',
        category: 'feature',
        type: 'travel',
        subcategory: 'location',
        duration: 168, // 7 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'access', feature: 'location_override' },
        metadata: { rarity: 'epic', color: 'blue' },
      },

      // 💎 PREMIUM ITEMS - Read Receipts
      {
        itemId: 'read-receipts-1-week',
        name: 'Read Receipts (1 Week)',
        description: 'See when your messages are read for 7 days',
        icon: '✓✓',
        price: 79,
        currency: 'premium',
        category: 'feature',
        type: 'read_receipts',
        subcategory: 'communication',
        duration: 168, // 7 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'social', feature: 'read_status' },
        metadata: { rarity: 'rare', color: 'green' },
      },
      {
        itemId: 'read-receipts-1-month',
        name: 'Read Receipts (1 Month)',
        description: 'See when your messages are read for 30 days',
        icon: '✓✓',
        price: 199,
        currency: 'premium',
        category: 'feature',
        type: 'read_receipts',
        subcategory: 'communication',
        duration: 720, // 30 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'social', feature: 'read_status' },
        metadata: { rarity: 'epic', color: 'green' },
      },

      // 🔥 FUEL ITEMS - Profile Highlights
      {
        itemId: 'profile-highlight-3-days',
        name: 'Profile Highlight (3 Days)',
        description: 'Highlight your profile with a special badge for 3 days',
        icon: '✨',
        price: 35,
        currency: 'fuel',
        category: 'cosmetic',
        type: 'highlight',
        subcategory: 'profile',
        duration: 72, // 3 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'profile', visibility: 'increased' },
        metadata: { rarity: 'rare', color: 'purple' },
      },
      {
        itemId: 'profile-highlight-1-week',
        name: 'Profile Highlight (1 Week)',
        description: 'Highlight your profile with a special badge for 7 days',
        icon: '✨',
        price: 75,
        currency: 'fuel',
        category: 'cosmetic',
        type: 'highlight',
        subcategory: 'profile',
        duration: 168, // 7 days
        maxUses: null,
        isActive: true,
        isPermanent: false,
        isLimited: false,
        requirements: null,
        effects: { type: 'profile', visibility: 'increased' },
        metadata: { rarity: 'epic', color: 'purple' },
      },
    ];

    let successCount = 0;
    let failCount = 0;

    for (const item of items) {
      try {
        await AppDataSource.query(
          `INSERT INTO store_items (
            "itemId", name, description, icon, price, currency, category, type, 
            subcategory, duration, "maxUses", "isActive", "isPermanent", "isLimited",
            requirements, effects, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
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
            item.requirements ? JSON.stringify(item.requirements) : null,
            item.effects ? JSON.stringify(item.effects) : null,
            item.metadata ? JSON.stringify(item.metadata) : null,
          ],
        );

        successCount++;
        console.log(
          `  ✅ ${item.name} (${item.price} ${item.currency === 'fuel' ? '🔥' : '💎'})`,
        );
      } catch (error: any) {
        failCount++;
        console.error(`  ❌ Failed to insert ${item.name}:`, error.message);
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ❌ Failed: ${failCount}`);
    console.log(`  📦 Total: ${items.length}\n`);

    // Verify counts by category
    const fuelItems = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM store_items WHERE currency = 'fuel'`,
    );
    const premiumItems = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM store_items WHERE currency = 'premium'`,
    );

    console.log(`🔥 Fuel items: ${fuelItems[0].count}`);
    console.log(`💎 Premium items: ${premiumItems[0].count}\n`);

    await AppDataSource.destroy();
    console.log('✅ Store populated successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

populateStore()
  .then(() => {
    console.log('🎯 Done! Store is ready for use.');
    process.exit(0);
  })
  .catch(() => process.exit(1));
