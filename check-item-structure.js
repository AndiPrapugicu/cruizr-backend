require('dotenv').config();
const { Client } = require('pg');

async function checkStructure() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const result = await client.query(`
      SELECT "itemId", name, category, subcategory, type, currency 
      FROM store_items 
      WHERE currency = 'fuel' 
      LIMIT 10
    `);

    console.log('📦 Sample Store Items Structure:\n');
    result.rows.forEach(row => {
      console.log(`Item: ${row.name}`);
      console.log(`  itemId: ${row.itemId}`);
      console.log(`  currency: ${row.currency}`);
      console.log(`  category: ${row.category}`);
      console.log(`  subcategory: ${row.subcategory}`);
      console.log(`  type: ${row.type}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkStructure();
