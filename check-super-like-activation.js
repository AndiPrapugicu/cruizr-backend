const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔍 Checking Super Like inventory for activation...');

// Check what itemId exists for Super Likes in inventory
db.all(
  `SELECT userId, itemId, isActive, usesRemaining FROM user_inventory WHERE itemId LIKE '%super-like%'`,
  (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }

    console.log('📦 Super Like inventory items:');
    rows.forEach((item) => {
      console.log(
        `  User ${item.userId}: itemId="${item.itemId}", Active: ${item.isActive}, Uses: ${item.usesRemaining}`,
      );
    });

    // Check user 1's inventory specifically
    db.all(
      `SELECT * FROM user_inventory WHERE userId = 1 AND itemId LIKE '%super-like%'`,
      (err, userRows) => {
        if (err) {
          console.error('Error:', err);
          return;
        }

        console.log('\n📦 User 1 Super Like inventory:');
        if (userRows.length === 0) {
          console.log('  No Super Like items found for user 1');

          // Add a Super Like for user 1 for testing
          db.run(
            `INSERT INTO user_inventory 
            (userId, itemId, quantity, usesRemaining, isActive, purchaseDate) 
            VALUES (1, 'super-like-3pack', 1, 3, 0, datetime('now'))`,
            function (err) {
              if (err) {
                console.error('Error adding Super Like:', err);
              } else {
                console.log('✅ Added super-like-3pack for user 1');
              }
              db.close();
            },
          );
        } else {
          userRows.forEach((item) => {
            console.log(
              `  ItemID: "${item.itemId}", Active: ${item.isActive}, Uses: ${item.usesRemaining}`,
            );
          });
          db.close();
        }
      },
    );
  },
);
