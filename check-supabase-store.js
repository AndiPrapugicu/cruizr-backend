const { DataSource } = require('typeorm');
require('dotenv').config();

async function checkSupabaseStore() {
  console.log('🔍 Checking Supabase Store...\n');

  const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
    logging: false,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to Supabase\n');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Check tables
    console.log('📋 Checking tables...');
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%store%' OR table_name LIKE '%inventory%'
      ORDER BY table_name
    `);
    
    console.log('Tables found:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    console.log('');

    // Check store_items
    if (tables.some(t => t.table_name === 'store_items')) {
      console.log('🛒 Store Items:');
      const items = await queryRunner.query(`
        SELECT "itemId", name, price, currency, category, type 
        FROM store_items 
        ORDER BY currency, price
      `);
      
      if (items.length === 0) {
        console.log('  ⚠️ No items found in store!\n');
      } else {
        console.log(`  Total: ${items.length} items\n`);
        
        const fuelItems = items.filter(i => i.currency === 'fuel');
        const premiumItems = items.filter(i => i.currency === 'premium');
        
        console.log(`  🔥 Fuel Items (${fuelItems.length}):`);
        fuelItems.forEach(item => {
          console.log(`    - ${item.name}: ${item.price} fuel (${item.type || item.category})`);
        });
        
        console.log(`\n  💎 Premium Items (${premiumItems.length}):`);
        premiumItems.forEach(item => {
          console.log(`    - ${item.name}: ${item.price} premium (${item.type || item.category})`);
        });
        console.log('');
      }
    }

    // Check user_inventory
    if (tables.some(t => t.table_name === 'user_inventory')) {
      console.log('📦 User Inventory:');
      const inventory = await queryRunner.query(`
        SELECT COUNT(*) as count FROM user_inventory
      `);
      console.log(`  Total items in inventories: ${inventory[0].count}\n`);

      if (inventory[0].count > 0) {
        const userItems = await queryRunner.query(`
          SELECT ui."userId", u.name, COUNT(*) as items 
          FROM user_inventory ui
          LEFT JOIN users u ON u.id = ui."userId"
          GROUP BY ui."userId", u.name
          ORDER BY items DESC
          LIMIT 10
        `);
        
        console.log('  Top users with items:');
        userItems.forEach(u => {
          console.log(`    - ${u.name || `User ${u.userId}`}: ${u.items} items`);
        });
        console.log('');
      }
    }

    // Check store_transactions
    if (tables.some(t => t.table_name === 'store_transactions')) {
      console.log('💳 Store Transactions:');
      const transactions = await queryRunner.query(`
        SELECT COUNT(*) as count FROM store_transactions
      `);
      console.log(`  Total transactions: ${transactions[0].count}\n`);

      if (transactions[0].count > 0) {
        const recent = await queryRunner.query(`
          SELECT st."transactionId", u.name, si.name as item, st.price, st.currency, st.status
          FROM store_transactions st
          LEFT JOIN users u ON u.id = st."userId"
          LEFT JOIN store_items si ON si.id = st."storeItemId"
          ORDER BY st.timestamp DESC
          LIMIT 10
        `);
        
        console.log('  Recent transactions:');
        recent.forEach(t => {
          console.log(`    - ${t.name || 'Unknown'} bought ${t.item} for ${t.price} ${t.currency} (${t.status})`);
        });
        console.log('');
      }
    }

    await queryRunner.release();
    await AppDataSource.destroy();

    console.log('✅ Check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

checkSupabaseStore()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
