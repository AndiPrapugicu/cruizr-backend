const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔧 Fixing Super Like inventory...');

// First check current state
db.all(
  "SELECT * FROM user_inventory WHERE itemId LIKE '%super-like%'",
  (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }

    console.log('📦 Current Super Like inventory:');
    rows.forEach((item) => {
      console.log(
        `  User ${item.userId}: ${item.itemId}, Active: ${item.isActive}, Uses: ${item.usesRemaining}`,
      );
    });

    // Activate existing super-like-3pack for user 15
    db.run(
      "UPDATE user_inventory SET isActive = 1, usesRemaining = 3 WHERE userId = 15 AND itemId = 'super-like-3pack'",
      function (err) {
        if (err) {
          console.error('Error activating:', err);
          return;
        }
        console.log('✅ Activated super-like-3pack for user 15');

        // Add Super Likes for recent users (19-22)
        const recentUsers = [19, 20, 21, 22];
        let completed = 0;

        recentUsers.forEach((userId) => {
          db.run(
            `INSERT OR REPLACE INTO user_inventory 
          (userId, itemId, quantity, usesRemaining, isActive, purchaseDate, expiryDate) 
          VALUES (?, 'super-like-3pack', 1, 3, 1, datetime('now'), NULL)`,
            [userId],
            function (err) {
              if (err) {
                console.error(
                  `Error adding super-like for user ${userId}:`,
                  err,
                );
              } else {
                console.log(`✅ Added super-like-3pack for user ${userId}`);
              }

              completed++;
              if (completed === recentUsers.length) {
                // Check final results
                db.all(
                  "SELECT * FROM user_inventory WHERE itemId LIKE '%super-like%' AND isActive = 1",
                  (err, inventory) => {
                    if (err) {
                      console.error('Error checking results:', err);
                      return;
                    }
                    console.log('\n🌟 Final active Super Like inventory:');
                    inventory.forEach((item) => {
                      console.log(
                        `  User ${item.userId}: ${item.itemId}, Uses: ${item.usesRemaining}`,
                      );
                    });
                    db.close();
                  },
                );
              }
            },
          );
        });
      },
    );
  },
);
