const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

console.log('=== CURRENT PROFILE FRAMES ===');

db.all(
  "SELECT * FROM store_items WHERE type = 'profile_frame' ORDER BY currency, price",
  (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }

    rows.forEach((frame) => {
      console.log(
        `ID: ${frame.itemId} - ${frame.name} - ${frame.currency === 'fuel' ? frame.price + ' fuel' : frame.price + ' premium'} - ${frame.description}`,
      );
    });

    console.log(`\nTotal Profile Frames: ${rows.length}`);

    db.close();
  },
);
