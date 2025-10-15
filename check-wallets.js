const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('./database.sqlite');

// Check fuel_wallets table structure
db.all('PRAGMA table_info(fuel_wallets)', (err, rows) => {
  if (err) {
    console.error('Error querying fuel_wallets structure:', err);
  } else {
    console.log('Fuel wallets table structure:');
    console.log(rows);
  }

  // Check existing wallets
  db.all('SELECT * FROM fuel_wallets', (err, rows) => {
    if (err) {
      console.error('Error querying fuel_wallets:', err);
    } else {
      console.log('Existing wallets:');
      console.log(rows);
    }

    db.close();
  });
});
