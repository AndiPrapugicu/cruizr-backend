const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

db.all('PRAGMA table_info(store_items)', (err, columns) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  console.log('=== STORE_ITEMS TABLE STRUCTURE ===');
  columns.forEach((col) => {
    console.log(
      `${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? 'DEFAULT ' + col.dflt_value : ''}`,
    );
  });

  db.close();
});
