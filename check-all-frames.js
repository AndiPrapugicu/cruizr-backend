const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('=== ALL PROFILE FRAMES ===');

db.all(
  'SELECT name, currency, price, type FROM store_items WHERE type = "profile_frame" ORDER BY currency, price',
  (err, items) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log('\nFuel Frames:');
    items
      .filter((i) => i.currency === 'fuel')
      .forEach((item) => {
        console.log(`- ${item.name} (${item.price} 🔥)`);
      });

    console.log('\nPremium Frames:');
    items
      .filter((i) => i.currency === 'premium')
      .forEach((item) => {
        console.log(`- ${item.name} (${item.price} 💎)`);
      });

    console.log(`\nTotal: ${items.length}`);
    console.log(
      `Fuel frames: ${items.filter((i) => i.currency === 'fuel').length}`,
    );
    console.log(
      `Premium frames: ${items.filter((i) => i.currency === 'premium').length}`,
    );

    db.close();
  },
);
