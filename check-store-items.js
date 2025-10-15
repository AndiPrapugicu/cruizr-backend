const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Checking store_items distribution...');

db.all(
  'SELECT itemId, name, price, currency, category, subcategory FROM store_items ORDER BY currency, category',
  (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }

    console.log('=== STORE ITEMS BY CURRENCY ===');

    const fuelItems = rows.filter((row) => row.currency === 'fuel');
    const premiumItems = rows.filter((row) => row.currency === 'premium');

    console.log(`\n🔥 FUEL ITEMS (${fuelItems.length} total):`);
    fuelItems.forEach((row) => {
      console.log(
        `  ${row.itemId}: ${row.name} - ${row.price} fuel (${row.category}/${row.subcategory})`,
      );
    });

    console.log(`\n💎 PREMIUM ITEMS (${premiumItems.length} total):`);
    premiumItems.forEach((row) => {
      console.log(
        `  ${row.itemId}: ${row.name} - ${row.price} premium (${row.category}/${row.subcategory})`,
      );
    });

    console.log('\n=== CATEGORIES BREAKDOWN ===');
    const categories = {};
    rows.forEach((row) => {
      const key = `${row.currency}-${row.category}`;
      if (!categories[key]) categories[key] = 0;
      categories[key]++;
    });

    Object.entries(categories).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} items`);
    });

    db.close();
  },
);
