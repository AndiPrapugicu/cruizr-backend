const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔧 Activating Super Likes for testing...');

// Activate super-like-3pack for user 15
db.run(
  "UPDATE user_inventory SET isActive = 1 WHERE userId = 15 AND itemId = 'super-like-3pack'",
  function (err) {
    if (err) {
      console.error('Error activating super-like-3pack:', err);
      return;
    }
    console.log('✅ Activated super-like-3pack for user 15');

    // Add some Super Likes to recent users for testing
    const recentUsers = [19, 20, 21, 22];
    let completed = 0;

    recentUsers.forEach((userId) => {
      db.run(
        `INSERT OR REPLACE INTO user_inventory 
        (userId, itemId, quantity, usesRemaining, isActive, purchaseDate) 
        VALUES (?, 'super-like-3pack', 1, 3, 1, datetime('now'))`,
        [userId],
        function (err) {
          if (err) {
            console.error(`Error adding super-like for user ${userId}:`, err);
          } else {
            console.log(`✅ Added super-like-3pack for user ${userId}`);
          }

          completed++;
          if (completed === recentUsers.length) {
            // Check results
            db.all(
              "SELECT * FROM user_inventory WHERE itemId LIKE '%super-like%' AND isActive = 1",
              (err, inventory) => {
                if (err) {
                  console.error('Error checking results:', err);
                  return;
                }
                console.log('\n📦 Active Super Like inventory:');
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
