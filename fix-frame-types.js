const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Updating existing frame types...');

db.run(
  'UPDATE store_items SET type = "profile_frame" WHERE subcategory = "frames"',
  function (err) {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('✓ Updated frame types');
    }

    // Check result
    db.all(
      "SELECT name, currency, price, type FROM store_items WHERE (name LIKE '%frame%' OR name LIKE '%Frame%') ORDER BY currency, price",
      (err, items) => {
        if (err) {
          console.error('Error querying frames:', err);
          return;
        }

        items.forEach((item) => {
          const currency =
            item.currency === 'fuel' ? `${item.price} 🔥` : `${item.price} 💎`;
          console.log(`${item.name} - ${currency} - type: ${item.type}`);
        });

        db.close();
      },
    );
  },
);
