require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Count total users
    const totalResult = await client.query('SELECT COUNT(*) as count FROM "user"');
    console.log('📊 Total users:', totalResult.rows[0].count);

    // Count users WITH coordinates
    const withCoordsResult = await client.query(
      'SELECT COUNT(*) as count FROM "user" WHERE latitude IS NOT NULL AND longitude IS NOT NULL'
    );
    console.log('✅ Users with coordinates:', withCoordsResult.rows[0].count);

    // Count users WITHOUT coordinates
    const withoutCoordsResult = await client.query(
      'SELECT COUNT(*) as count FROM "user" WHERE latitude IS NULL OR longitude IS NULL'
    );
    console.log('❌ Users without coordinates:', withoutCoordsResult.rows[0].count);

    // Show sample users with coordinates
    console.log('\n📍 Sample users WITH coordinates:');
    const sampleWithCoords = await client.query(
      'SELECT id, name, latitude, longitude, city, email FROM "user" WHERE latitude IS NOT NULL AND longitude IS NOT NULL LIMIT 10'
    );
    console.table(sampleWithCoords.rows);

    // Show sample users WITHOUT coordinates
    console.log('\n🚫 Sample users WITHOUT coordinates:');
    const sampleWithoutCoords = await client.query(
      'SELECT id, name, latitude, longitude, city, email FROM "user" WHERE latitude IS NULL OR longitude IS NULL LIMIT 10'
    );
    console.table(sampleWithoutCoords.rows);

    // Check all users
    console.log('\n🔍 All users summary:');
    const allUsers = await client.query(
      'SELECT id, name, email, latitude, longitude, city FROM "user" ORDER BY id'
    );
    console.table(allUsers.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();
