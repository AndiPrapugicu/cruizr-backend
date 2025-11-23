require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('📝 Adding prefWorldwide column to user table...');
    
    await client.query(`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS "prefWorldwide" boolean DEFAULT false
    `);

    console.log('✅ Column prefWorldwide added successfully!\n');

    // Verify
    const result = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user' AND column_name = 'prefWorldwide'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verification successful:');
      console.log(result.rows[0]);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();
