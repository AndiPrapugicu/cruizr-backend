const { createConnection } = require('typeorm');
const path = require('path');

async function addCategoryColumn() {
  try {
    const connection = await createConnection({
      type: 'sqlite',
      database: path.join(__dirname, 'database.sqlite'),
      synchronize: false,
      logging: false,
    });

    console.log('🏗️ Adding category column to badges table...');

    // Add category column
    await connection.query(
      'ALTER TABLE badges ADD COLUMN category varchar DEFAULT "achievement"',
    );

    console.log('📝 Updating badge categories...');

    // Update categories for existing badges
    await connection.query(
      'UPDATE badges SET category = "car" WHERE key IN ("first_car", "car_collector", "modification_master")',
    );
    await connection.query(
      'UPDATE badges SET category = "performance" WHERE key IN ("speed_demon", "classic_lover", "eco_warrior")',
    );
    await connection.query(
      'UPDATE badges SET category = "social" WHERE key IN ("first_match", "chat_starter", "popular_ride", "trendsetter")',
    );
    await connection.query(
      'UPDATE badges SET category = "streaks" WHERE key IN ("daily_driver", "car_enthusiast", "car_photographer")',
    );
    await connection.query(
      'UPDATE badges SET category = "special" WHERE key IN ("summer_cruiser", "romanian_pride")',
    );

    console.log('✅ Categories updated successfully!');

    // Verify the changes
    const updatedBadges = await connection.query(
      'SELECT id, name, category FROM badges ORDER BY id',
    );
    console.log('🎯 Updated badges with categories:');
    console.log(JSON.stringify(updatedBadges, null, 2));

    await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

addCategoryColumn();
