const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔍 Checking Super Like mapping...');

// Check super like store items specifically
db.all(
  "SELECT * FROM store_items WHERE name LIKE '%Super Like%'",
  (err, superLikes) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('🌟 Super Like store items:');
    superLikes.forEach((item) => {
      console.log(
        `  ID: ${item.id}, Name: ${item.name}, Uses: ${item.uses}, Duration: ${item.duration}`,
      );
    });

    // Check inventory with super-like items
    db.all(
      "SELECT * FROM user_inventory WHERE itemId LIKE '%super-like%'",
      (err, inventory) => {
        if (err) {
          console.error('Error:', err);
          return;
        }
        console.log('\n📦 Super Like inventory items:');
        inventory.forEach((item) => {
          console.log(
            `  User ${item.userId}: ItemID: ${item.itemId}, Active: ${item.isActive}, Uses: ${item.usesRemaining}`,
          );
        });

        // Check what itemId format is expected
        console.log('\n🔍 Checking itemId format expectations...');
        console.log('Code expects: "super-like-5pack"');
        console.log('Store has: ID numbers (6, 7, 26, 27)');
        console.log('Inventory has: "super-like-single", "super-like-3pack"');

        db.close();
      },
    );
  },
);
