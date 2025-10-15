const Database = require('better-sqlite3');
const db = new Database('./database.sqlite');

console.log('=== PROFILE FRAME ITEM IDs ===');
const frames = db
  .prepare('SELECT itemId, name FROM store_items WHERE type = ?')
  .all('profile_frame');

frames.forEach((frame) => {
  console.log(`ID: ${frame.itemId} | Name: ${frame.name}`);
});

db.close();
