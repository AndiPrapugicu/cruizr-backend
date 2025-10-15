const fs = require('fs');
const Database = require('sqlite3').Database;

const db = new Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to SQLite database');
});

console.log('\n=== CURRENT PROFILE FRAMES ===');

db.all(
  "SELECT name, currency, price, description FROM store_items WHERE type = 'profile_frame' ORDER BY currency, price",
  (err, rows) => {
    if (err) {
      console.error('Error querying database:', err);
      return;
    }

    rows.forEach((frame) => {
      const currency =
        frame.currency === 'fuel' ? `${frame.price} 🔥` : `${frame.price} 💎`;
      console.log(`${frame.name} - ${currency} - ${frame.description}`);
    });

    console.log(`\nTotal profile frames: ${rows.length}`);

    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  },
);
