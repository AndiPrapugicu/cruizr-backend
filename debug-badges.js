const { createConnection } = require('typeorm');
const path = require('path');

async function debugBadges() {
  try {
    // Create connection to database
    const connection = await createConnection({
      type: 'sqlite',
      database: path.join(__dirname, 'database.sqlite'),
      synchronize: false,
      logging: false,
    });

    console.log('🚗 User cars:');
    const cars = await connection.query('SELECT * FROM cars WHERE userId = ?', [
      1,
    ]);
    console.log(JSON.stringify(cars, null, 2));

    console.log('\n🏆 User badges:');
    const badges = await connection.query(
      'SELECT * FROM user_badges WHERE userId = ?',
      [1],
    );
    console.log(JSON.stringify(badges, null, 2));

    console.log('\n🎯 All badges:');
    const allBadges = await connection.query('SELECT * FROM badges');
    console.log(JSON.stringify(allBadges, null, 2));

    await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugBadges();
