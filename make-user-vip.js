require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

const userId = process.argv[2] || 1;

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Make user VIP
    await client.query(
      `UPDATE "user" 
       SET "isVip" = true, 
           "vipTitle" = 'Car Enthusiast VIP', 
           "vipExpiresAt" = NOW() + INTERVAL '30 days'
       WHERE id = $1`,
      [userId]
    );

    console.log(`🌟 User ${userId} is now VIP!`);
    console.log(`   • VIP Title: Car Enthusiast VIP`);
    console.log(`   • Expires: 30 days from now`);
    console.log(`   • Worldwide search: ENABLED\n`);

    // Show user info
    const user = await client.query(
      `SELECT id, name, email, "isVip", "vipTitle", "vipExpiresAt", "prefWorldwide" 
       FROM "user" WHERE id = $1`,
      [userId]
    );

    console.log('👤 User Info:');
    console.log(user.rows[0]);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();
