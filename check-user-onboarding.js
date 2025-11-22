const { Client } = require('pg');
require('dotenv').config();

async function checkUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check all users with name 'asd'
    const result = await client.query(
      'SELECT id, name, email, "onboardingCompleted", "createdAt" FROM "user" WHERE name = $1 ORDER BY id DESC',
      ['asd']
    );

    console.log('\n📋 Users named "asd":');
    console.log('=====================================');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Onboarding Completed: ${user.onboardingCompleted}`);
      console.log(`Created At: ${user.createdAt}`);
      console.log('-------------------------------------');
    });

    console.log(`\nTotal users found: ${result.rows.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();
