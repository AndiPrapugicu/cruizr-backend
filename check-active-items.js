const { Client } = require('pg');
require('dotenv').config();

async function checkActiveItems() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check user inventory for user 18
    const userId = 18;
    
    const inventoryQuery = `
      SELECT 
        ui.id,
        ui."userId",
        ui."itemId",
        ui."isActive",
        ui."purchaseDate",
        ui."expiryDate",
        ui."usesRemaining",
        si.name,
        si.subcategory,
        si.type
      FROM user_inventory ui
      LEFT JOIN store_items si ON ui."storeItemId" = si.id
      WHERE ui."userId" = $1
      ORDER BY ui."purchaseDate" DESC
    `;

    const result = await client.query(inventoryQuery, [userId]);
    
    console.log(`\n📦 User ${userId} Inventory:`);
    console.log(`Total items: ${result.rows.length}\n`);
    
    result.rows.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name || 'Unknown Item'}`);
      console.log(`   Item ID: ${item.itemId}`);
      console.log(`   Active: ${item.isActive ? '✅ YES' : '❌ NO'}`);
      console.log(`   Type: ${item.type}`);
      console.log(`   Subcategory: ${item.subcategory}`);
      console.log(`   Purchased: ${item.purchaseDate}`);
      if (item.usesRemaining !== null) {
        console.log(`   Uses remaining: ${item.usesRemaining}`);
      }
      console.log('');
    });

    // Check specifically for active items
    const activeQuery = `
      SELECT 
        ui."itemId",
        si.name,
        si.subcategory,
        ui."isActive"
      FROM user_inventory ui
      LEFT JOIN store_items si ON ui."storeItemId" = si.id
      WHERE ui."userId" = $1 AND ui."isActive" = true
    `;

    const activeResult = await client.query(activeQuery, [userId]);
    
    console.log(`\n🔥 Active Items (${activeResult.rows.length}):`);
    activeResult.rows.forEach((item) => {
      console.log(`  - ${item.name} (${item.itemId}) - subcategory: ${item.subcategory}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkActiveItems();
