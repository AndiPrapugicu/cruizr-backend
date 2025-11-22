// Script to fix old users who have data but onboardingCompleted is false
require('dotenv').config();
const { Client } = require('pg');

async function fixOldUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Update user with email asd@asd.asd to have onboardingCompleted: true
    const result = await client.query(
      `UPDATE "user" SET "onboardingCompleted" = true WHERE email = $1 RETURNING id, name, email, "onboardingCompleted"`,
      ['asd@asd.asd']
    );

    if (result.rows.length > 0) {
      console.log('✅ Updated user:', result.rows[0]);
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixOldUser();
