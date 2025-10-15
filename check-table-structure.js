const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Checking store_items table structure...');

db.all('PRAGMA table_info(store_items);', (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  console.log('Store items table structure:');
  rows.forEach((row) => {
    console.log(
      `${row.name}: ${row.type} (${row.notnull ? 'NOT NULL' : 'NULL'}) ${row.pk ? 'PRIMARY KEY' : ''}`,
    );
  });

  console.log('\n=== ALL ITEMS WITH FRAME IN NAME ===');

  db.all(
    "SELECT * FROM store_items WHERE name LIKE '%frame%' OR name LIKE '%Frame%' ORDER BY price",
    (err, items) => {
      if (err) {
        console.error('Error querying items:', err);
        return;
      }

      items.forEach((item) => {
        const currency =
          item.currency === 'fuel' ? `${item.price} 🔥` : `${item.price} 💎`;
        console.log(`${item.name} - ${currency} - ${item.description}`);
      });

      console.log(`\nTotal frame items: ${items.length}`);

      db.close();
    },
  );
});
