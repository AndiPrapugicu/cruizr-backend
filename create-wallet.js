const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('./database.sqlite');

console.log('Creating wallet for TestDoi (ID: 9)...');

// Create wallet for TestDoi
db.run(
  `INSERT INTO fuel_wallets (userId, balance, totalEarned, totalSpent, createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
  [9, 100, 100, 0],
  function (err) {
    if (err) {
      console.error('Error creating wallet:', err);
    } else {
      console.log('Wallet created for TestDoi with ID:', this.lastID);
    }

    // Check the wallet
    db.all('SELECT * FROM fuel_wallets WHERE userId = 9', (err, rows) => {
      if (err) {
        console.error('Error querying wallet:', err);
      } else {
        console.log('TestDoi wallet:');
        console.log(rows);
      }

      db.close();
    });
  },
);
