require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

// Coordonate pentru diferite orașe din România
const locations = [
  { city: 'Bucharest', lat: 44.4268, lng: 26.1025 }, // București centru
  { city: 'Bucharest North', lat: 44.4850, lng: 26.0950 }, // București nord
  { city: 'Bucharest South', lat: 44.3850, lng: 26.1200 }, // București sud
  { city: 'Iași', lat: 47.1585, lng: 27.6014 }, // Iași
  { city: 'Cluj-Napoca', lat: 46.7712, lng: 23.6236 }, // Cluj
  { city: 'Timișoara', lat: 45.7489, lng: 21.2087 }, // Timișoara
  { city: 'Brașov', lat: 45.6427, lng: 25.5887 }, // Brașov
  { city: 'Constanța', lat: 44.1598, lng: 28.6348 }, // Constanța
];

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all users
    const usersResult = await client.query('SELECT id, name, email FROM "user" ORDER BY id');
    const users = usersResult.rows;
    
    console.log(`📊 Found ${users.length} users. Setting coordinates...\n`);

    let updated = 0;
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const location = locations[i % locations.length]; // Rotate through locations
      
      // Add small random variation to coordinates (±0.01 degrees ≈ ±1km)
      const randomLat = location.lat + (Math.random() - 0.5) * 0.02;
      const randomLng = location.lng + (Math.random() - 0.5) * 0.02;
      
      await client.query(
        'UPDATE "user" SET latitude = $1, longitude = $2, city = $3 WHERE id = $4',
        [randomLat, randomLng, location.city, user.id]
      );
      
      console.log(`✅ User ${user.id} (${user.name}) → ${location.city} (${randomLat.toFixed(4)}, ${randomLng.toFixed(4)})`);
      updated++;
    }

    console.log(`\n🎉 Successfully updated ${updated} users with coordinates!`);

    // Verify
    console.log('\n📍 Verification - Users with coordinates:');
    const verifyResult = await client.query(
      'SELECT id, name, city, latitude, longitude FROM "user" WHERE latitude IS NOT NULL ORDER BY id LIMIT 10'
    );
    console.table(verifyResult.rows);

    const withCoordsCount = await client.query(
      'SELECT COUNT(*) as count FROM "user" WHERE latitude IS NOT NULL AND longitude IS NOT NULL'
    );
    console.log(`\n✅ Total users with coordinates: ${withCoordsCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();
