const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/sqlite.db');

console.log('🔍 Checking user inventory...');

// Check user inventory
db.all('SELECT * FROM user_inventory WHERE userId = 1', (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  console.log('📦 User inventory:', rows);

  // Check store items
  db.all(
    'SELECT * FROM store_items WHERE itemId = ?',
    ['reverse-swipe'],
    (err2, items) => {
      if (err2) {
        console.error('Error:', err2);
        return;
      }

      console.log('🛒 Store item:', items);
      db.close();
    },
  );
});
