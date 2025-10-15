const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

console.log('=== DETAILED STORE ITEMS ===');

try {
  const items = db
    .prepare(
      `
    SELECT itemId, name, price, currency, type, category, realMoneyCost 
    FROM store_items 
    ORDER BY currency, type, itemId
  `,
    )
    .all();

  console.log('Fuel Items:');
  items
    .filter((item) => item.currency === 'fuel')
    .forEach((item) => {
      console.log(
        `  ${item.itemId}: ${item.name} - ${item.price} fuel (${item.type}, ${item.category})`,
      );
    });

  console.log('\nPremium Items:');
  items
    .filter((item) => item.currency === 'premium')
    .forEach((item) => {
      console.log(
        `  ${item.itemId}: ${item.name} - ${item.price} premium (${item.type}, ${item.category})`,
      );
    });

  console.log('\nReal Money Items:');
  items
    .filter((item) => item.realMoneyCost > 0)
    .forEach((item) => {
      console.log(
        `  ${item.itemId}: ${item.name} - $${item.realMoneyCost} (${item.type}, ${item.category})`,
      );
    });
} catch (error) {
  console.error('Error:', error.message);
} finally {
  db.close();
}
