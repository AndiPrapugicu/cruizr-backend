const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔍 Checking main database tables...');

// Check what tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  console.log('📋 Available tables:', tables);

  // Try the correct table names based on entities
  db.all(
    "SELECT * FROM store_items WHERE itemId = 'reverse-swipe'",
    (err2, items) => {
      if (err2) {
        console.log('❌ store_items error:', err2.message);
      } else {
        console.log('🛒 Store items (reverse-swipe):', items);
      }

      // Try user_inventory table
      db.all(
        'SELECT * FROM user_inventory WHERE userId = 1',
        (err3, userItems) => {
          if (err3) {
            console.log('❌ user_inventory error:', err3.message);
          } else {
            console.log('📦 User inventory:', userItems);
          }

          db.close();
        },
      );
    },
  );
});
