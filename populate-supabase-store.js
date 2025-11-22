const { DataSource } = require('typeorm');
require('dotenv').config();

// Enterprise Store Items - Complete Product Catalog
const enterpriseStoreItems = [
  // ========== FUEL ITEMS (🔥) ==========

  // BASIC BOOSTS
  {
    itemId: 'profile-boost-1h',
    name: 'Profile Boost (1h)',
    description: 'Boost your profile to 10x more visibility for 1 hour. Be seen by more potential matches!',
    icon: '🚀',
    price: 25,
    currency: 'fuel',
    category: 'boost',
    type: 'boost',
    subcategory: 'visibility',
    duration: 1,
    maxUses: null,
    isActive: true,
    isPermanent: false,
    isLimited: false,
    requirements: null,
    effects: { boostMultiplier: 10, duration: 1, type: 'visibility' },
    metadata: { color: 'blue', rarity: 'common' },
  },
  {
    itemId: 'profile-boost-3h',
    name: 'Profile Boost (3h)',
    description: 'Boost your profile to 10x more visibility for 3 hours. Extended visibility!',
    icon: '🚀',
    price: 60,
    currency: 'fuel',
    category: 'boost',
    type: 'boost',
    subcategory: 'visibility',
    duration: 3,
    maxUses: null,
    isActive: true,
    isPermanent: false,
    isLimited: false,
    requirements: null,
    effects: { boostMultiplier: 10, duration: 3, type: 'visibility' },
    metadata: { color: 'blue', rarity: 'common' },
  },
  {
    itemId: 'profile-boost-24h',
    name: 'Profile Boost (24h)',
    description: 'Boost your profile to 10x more visibility for 24 hours. Maximum exposure!',
    icon: '🚀',
    price: 200,
    currency: 'fuel',
    category: 'boost',
    type: 'boost',
    subcategory: 'visibility',
    duration: 24,
    maxUses: null,
    isActive: true,
    isPermanent: false,
    isLimited: false,
    requirements: null,
    effects: { boostMultiplier: 10, duration: 24, type: 'visibility' },
    metadata: { color: 'purple', rarity: 'rare' },
  },

  // SUPER LIKES
  {
    itemId: 'super-like-5',
    name: '5 Super Likes',
    description: 'Stand out with 5 Super Likes! Let them know you\'re really interested.',
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
    metadata: { color: 'yellow', rarity: 'common' },
  },
  {
    itemId: 'super-like-10',
    name: '10 Super Likes',
    description: 'Stand out with 10 Super Likes! Double your chances of getting noticed.',
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
    metadata: { color: 'yellow', rarity: 'common' },
  },

  // REWIND
  {
    itemId: 'rewind-5',
    name: '5 Rewinds',
    description: 'Made a mistake? Get 5 chances to undo your last swipe!',
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
    metadata: { color: 'orange', rarity: 'common' },
  },
  {
    itemId: 'rewind-unlimited',
    name: 'Unlimited Rewinds (24h)',
    description: 'Undo as many swipes as you want for 24 hours!',
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
    metadata: { color: 'orange', rarity: 'rare' },
  },

  // ========== PREMIUM ITEMS (💎) ==========

  // PREMIUM ACCESS
  {
    itemId: 'premium-1-month',
    name: 'Premium (1 Month)',
    description: 'Unlock all premium features for 1 month! See who likes you, unlimited likes, and more.',
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
    metadata: { color: 'gold', rarity: 'epic' },
  },
  {
    itemId: 'premium-3-months',
    name: 'Premium (3 Months)',
    description: 'Unlock all premium features for 3 months! Best value for serious daters.',
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
    metadata: { color: 'gold', rarity: 'epic' },
  },

  // SEE WHO LIKES YOU
  {
    itemId: 'see-likes-1-day',
    name: 'See Who Likes You (1 Day)',
    description: 'See everyone who has liked your profile for 24 hours!',
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
    metadata: { color: 'pink', rarity: 'rare' },
  },
  {
    itemId: 'see-likes-1-week',
    name: 'See Who Likes You (1 Week)',
    description: 'See everyone who has liked your profile for 7 days!',
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
    metadata: { color: 'pink', rarity: 'rare' },
  },

  // PROFILE FRAMES
  {
    itemId: 'frame-gold',
    name: 'Gold Profile Frame',
    description: 'Stand out with a luxurious gold frame around your profile!',
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
    metadata: { color: 'gold', rarity: 'epic' },
  },
  {
    itemId: 'frame-rainbow',
    name: 'Rainbow Profile Frame',
    description: 'Show your personality with a vibrant rainbow frame!',
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
    metadata: { color: 'rainbow', rarity: 'rare' },
  },

  // UNLIMITED LIKES
  {
    itemId: 'unlimited-likes-1-day',
    name: 'Unlimited Likes (1 Day)',
    description: 'Swipe without limits for 24 hours!',
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
    metadata: { color: 'red', rarity: 'common' },
  },
  {
    itemId: 'unlimited-likes-1-week',
    name: 'Unlimited Likes (1 Week)',
    description: 'Swipe without limits for 7 days!',
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
    metadata: { color: 'red', rarity: 'rare' },
  },
];

async function populateSupabaseStore() {
  console.log('🏪 Populating Supabase Store...\n');

  // Create TypeORM connection to Supabase
  const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['src/**/*.entity.ts'],
    synchronize: false, // Don't auto-sync in production
    logging: true,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to Supabase\n');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Check if tables exist
    console.log('🔍 Checking tables...');
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('store_items', 'user_inventory', 'store_transactions')
    `);
    
    console.log('📋 Found tables:', tables.map(t => t.table_name).join(', '));

    if (!tables.some(t => t.table_name === 'store_items')) {
      console.log('\n❌ store_items table does not exist!');
      console.log('💡 Run your NestJS app first to create the tables via TypeORM sync.');
      await queryRunner.release();
      await AppDataSource.destroy();
      return;
    }

    // Clear existing items
    console.log('\n🗑️ Clearing existing store items...');
    await queryRunner.query('DELETE FROM store_items');
    console.log('✅ Store cleared\n');

    // Insert new items
    console.log('📦 Inserting store items...\n');
    
    for (const item of enterpriseStoreItems) {
      try {
        await queryRunner.query(`
          INSERT INTO store_items (
            "itemId", name, description, icon, price, currency, category, type, 
            subcategory, duration, "maxUses", "isActive", "isPermanent", "isLimited",
            requirements, effects, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
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
        ]);

        console.log(`  ✅ ${item.name} (${item.price} ${item.currency})`);
      } catch (error) {
        console.error(`  ❌ Failed to insert ${item.name}:`, error.message);
      }
    }

    // Verify insertion
    console.log('\n🔍 Verifying store items...');
    const items = await queryRunner.query('SELECT COUNT(*) as count FROM store_items');
    console.log(`✅ Total items in store: ${items[0].count}\n`);

    // Show items by category
    const fuelItems = await queryRunner.query(`SELECT COUNT(*) as count FROM store_items WHERE currency = 'fuel'`);
    const premiumItems = await queryRunner.query(`SELECT COUNT(*) as count FROM store_items WHERE currency = 'premium'`);
    
    console.log(`🔥 Fuel items: ${fuelItems[0].count}`);
    console.log(`💎 Premium items: ${premiumItems[0].count}\n`);

    await queryRunner.release();
    await AppDataSource.destroy();

    console.log('✅ Store populated successfully!\n');
    console.log('🎯 You can now test purchases on the frontend!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
populateSupabaseStore()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
