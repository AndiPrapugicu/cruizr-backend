const { createConnection } = require('typeorm');
const path = require('path');

async function checkCurrentBadges() {
  try {
    const connection = await createConnection({
      type: 'sqlite',
      database: path.join(__dirname, 'database.sqlite'),
      synchronize: false,
      logging: false,
    });

    console.log('🏆 Current user badges after cleanup:');
    const userBadges = await connection.query(
      'SELECT ub.*, b.name, b.category FROM user_badges ub JOIN badges b ON ub.badgeId = b.id WHERE ub.userId = 1 AND ub.isUnlocked = 1',
    );
    console.log(JSON.stringify(userBadges, null, 2));

    console.log('\n🎯 Available badges by category:');
    const categories = ['car', 'performance', 'social', 'streaks', 'special'];

    for (const category of categories) {
      const badges = await connection.query(
        'SELECT name, category FROM badges WHERE category = ? ORDER BY name',
        [category],
      );
      console.log(`\n${category.toUpperCase()}:`);
      badges.forEach((badge) => console.log(`  - ${badge.name}`));
    }

    await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCurrentBadges();
