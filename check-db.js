const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/sqlite.db');

console.log('🔍 Checking database tables...');

// Check what tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  console.log('📋 Available tables:', tables);

  // Look for any inventory or store related tables
  const inventoryTables = tables.filter(
    (t) => t.name.includes('inventory') || t.name.includes('store'),
  );
  console.log('🛒 Store/inventory tables:', inventoryTables);

  // Check user_store_items table (alternative name)
  db.all('SELECT * FROM user_store_items WHERE userId = 1', (err2, rows) => {
    if (err2) {
      console.log('❌ user_store_items not found:', err2.message);

      // Try store_items table
      db.all(
        "SELECT * FROM store_items WHERE itemId = 'reverse-swipe'",
        (err3, items) => {
          if (err3) {
            console.log('❌ store_items not found:', err3.message);
          } else {
            console.log('🛒 Store items (reverse-swipe):', items);
          }
          db.close();
        },
      );
    } else {
      console.log('📦 User store items:', rows);
      db.close();
    }
  });
});
