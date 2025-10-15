const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔍 Checking current user and inventory...');

// Check latest users
db.all(
  'SELECT id, name, email FROM user ORDER BY id DESC LIMIT 5',
  (err, users) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('👤 Latest users:');
    users.forEach((user) => {
      console.log(`  ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
    });

    // Check inventory for recent users
    db.all(
      'SELECT * FROM user_inventory WHERE userId IN (15, 18, 19, 20, 21)',
      (err, inventory) => {
        if (err) {
          console.error('Error:', err);
          return;
        }
        console.log('\n📦 Inventory for recent users:');
        if (inventory.length === 0) {
          console.log('  No inventory found for these users');
        } else {
          inventory.forEach((item) => {
            console.log(
              `  User ${item.userId}: ${item.itemId}, Active: ${item.isActive}, Uses: ${item.usesRemaining}`,
            );
          });
        }

        // Check all store items
        db.all('SELECT * FROM store_items', (err, storeItems) => {
          if (err) {
            console.error('Error:', err);
            return;
          }
          console.log('\n🏪 All store items:');
          storeItems.forEach((item) => {
            console.log(
              `  ID: ${item.id}, Name: ${item.name}, Category: ${item.category}, Uses: ${item.uses}`,
            );
          });

          db.close();
        });
      },
    );
  },
);
