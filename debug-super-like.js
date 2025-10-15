// Test Super Like Debug
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function debugSuperLike() {
  console.log('🔍 Starting Super Like debug...');

  // Check user inventory for super likes
  await new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM user_inventory WHERE itemId = 'super-like-5pack'`,
      (err, rows) => {
        if (err) {
          console.error('❌ Error checking inventory:', err);
          reject(err);
          return;
        }

        console.log('📦 Super Like inventory items:');
        rows.forEach((item) => {
          console.log('  User ID:', item.userId);
          console.log('  Item ID:', item.itemId);
          console.log('  Is Active:', item.isActive);
          console.log('  Uses Remaining:', item.usesRemaining);
          console.log('  Expiry Date:', item.expiryDate);
          console.log('  Purchase Date:', item.purchaseDate);
          console.log('  ---');
        });
        resolve();
      },
    );
  });

  // Check store items
  await new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM store_items WHERE id LIKE '%super-like%'`,
      (err, rows) => {
        if (err) {
          console.error('❌ Error checking store items:', err);
          reject(err);
          return;
        }

        console.log('🏪 Super Like store items:');
        rows.forEach((item) => {
          console.log('  ID:', item.id);
          console.log('  Name:', item.name);
          console.log('  Category:', item.category);
          console.log('  Type:', item.type);
          console.log('  Uses:', item.uses);
          console.log('  ---');
        });
        resolve();
      },
    );
  });

  // Check recent swipes for testing users
  await new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM swipes ORDER BY createdAt DESC LIMIT 10`,
      (err, rows) => {
        if (err) {
          console.error('❌ Error checking swipes:', err);
          reject(err);
          return;
        }

        console.log('📱 Recent swipes:');
        rows.forEach((swipe) => {
          console.log('  From User:', swipe.fromUserId);
          console.log('  To User:', swipe.toUserId);
          console.log('  Type:', swipe.type);
          console.log('  Created:', swipe.createdAt);
          console.log('  ---');
        });
        resolve();
      },
    );
  });

  db.close();
}

debugSuperLike().catch(console.error);
