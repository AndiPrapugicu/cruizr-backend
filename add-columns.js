const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Adding missing columns to store_items table...');

// Add type column
db.run('ALTER TABLE store_items ADD COLUMN type varchar', function (err) {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Error adding type column:', err);
  } else {
    console.log('✓ Type column added/exists');
  }
});

// Add features column
db.run('ALTER TABLE store_items ADD COLUMN features json', function (err) {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Error adding features column:', err);
  } else {
    console.log('✓ Features column added/exists');
  }

  // Update existing items with type based on subcategory
  db.run(
    `UPDATE store_items SET type = subcategory WHERE type IS NULL`,
    function (err) {
      if (err) {
        console.error('Error updating types:', err);
      } else {
        console.log('✓ Updated existing items with type');
      }

      // Check the result
      db.all('PRAGMA table_info(store_items)', (err, rows) => {
        if (err) {
          console.error('Error checking table:', err);
          return;
        }

        console.log('\nUpdated table structure:');
        rows.forEach((col) => {
          console.log(`- ${col.name}: ${col.type}`);
        });

        console.log('\n=== Current Profile Frames ===');
        db.all(
          "SELECT name, currency, price, type FROM store_items WHERE (name LIKE '%frame%' OR name LIKE '%Frame%') ORDER BY currency, price",
          (err, items) => {
            if (err) {
              console.error('Error querying frames:', err);
              return;
            }

            items.forEach((item) => {
              const currency =
                item.currency === 'fuel'
                  ? `${item.price} 🔥`
                  : `${item.price} 💎`;
              console.log(
                `${item.name} - ${currency} - type: ${item.type || 'NULL'}`,
              );
            });

            console.log(`\nTotal frames: ${items.length}`);
            db.close();
          },
        );
      });
    },
  );
});
