require('dotenv').config();
const { Client } = require('pg');

async function listCategories() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const fuelCats = await client.query(`
      SELECT DISTINCT category 
      FROM store_items 
      WHERE currency = 'fuel' AND "isActive" = true
      ORDER BY category
    `);
    
    const premiumCats = await client.query(`
      SELECT DISTINCT category 
      FROM store_items 
      WHERE currency = 'premium' AND "isActive" = true
      ORDER BY category
    `);

    console.log('🔥 FUEL Categories:', fuelCats.rows.map(r => r.category));
    console.log('💎 PREMIUM Categories:', premiumCats.rows.map(r => r.category));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

listCategories();
