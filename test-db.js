const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('./database.sqlite');

console.log('Testing database connection...');

// Check what tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
  if (err) {
    console.error('Error querying tables:', err);
  } else {
    console.log('Available tables:');
    console.log(rows);
  }
});

// Check match table structure
db.all('PRAGMA table_info(match)', (err, rows) => {
  if (err) {
    console.error('Error querying match structure:', err);
  } else {
    console.log('Match table structure:');
    console.log(rows);
  }
});

// Check user table structure
db.all('PRAGMA table_info(user)', (err, rows) => {
  if (err) {
    console.error('Error querying user structure:', err);
  } else {
    console.log('User table structure:');
    console.log(rows);
  }
});

// Check all users
db.all('SELECT * FROM user', (err, rows) => {
  if (err) {
    console.error('Error querying user:', err);
  } else {
    console.log('All users:');
    console.log(rows);
  }

  // Check if TestDoi exists
  const testDoiExists = rows.some((user) => user.email === 'test2@email.com');

  if (!testDoiExists) {
    console.log('TestDoi not found. Adding TestDoi user...');

    // Add TestDoi user
    db.run(
      `INSERT INTO user (name, email, password, carModel, imageUrl) VALUES (?, ?, ?, ?, ?)`,
      [
        'TestDoi',
        'test2@email.com',
        '$2b$10$mDFU2rmBsbkLAQX6kimil./PYsHcjiQvytWRnlbibPDerkOrewZqK',
        'BMW X5',
        '/uploads/photos/test-doi.jpg',
      ],
      function (err) {
        if (err) {
          console.error('Error adding TestDoi:', err);
        } else {
          console.log('TestDoi added with ID:', this.lastID);

          // Now create a Super Like from Andi to TestDoi
          db.run(
            `INSERT INTO match (userAId, userBId, status) VALUES (?, ?, ?)`,
            [1, this.lastID, 'pending'],
            function (err) {
              if (err) {
                console.error('Error creating Super Like:', err);
              } else {
                console.log(
                  'Super Like created from Andi to TestDoi with ID:',
                  this.lastID,
                );
              }

              // Close connection
              db.close();
            },
          );
        }
      },
    );
  } else {
    console.log('TestDoi already exists');

    // Check if TestDoi has a wallet
    db.all(
      'SELECT * FROM fuel_wallets WHERE userId = ?',
      [9],
      (err, wallets) => {
        if (err) {
          console.error('Error querying wallets:', err);
        } else {
          console.log('TestDoi wallets:');
          console.log(wallets);

          if (wallets.length === 0) {
            console.log('Creating wallet for TestDoi...');

            // Create wallet for TestDoi
            db.run(
              `INSERT INTO fuel_wallets (userId, balance, totalEarned, totalSpent, lastEarned, createdAt, updatedAt) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
              [9, 100, 100, 0],
              function (err) {
                if (err) {
                  console.error('Error creating wallet:', err);
                } else {
                  console.log(
                    'Wallet created for TestDoi with ID:',
                    this.lastID,
                  );
                }

                // Close connection
                db.close();
              },
            );
          } else {
            console.log('TestDoi already has a wallet');
            db.close();
          }
        }
      },
    );
  }
});
