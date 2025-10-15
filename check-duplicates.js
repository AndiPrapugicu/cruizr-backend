const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔍 Checking for duplicate items...');

// Check Profile Frame duplicates
db.all(
  "SELECT id, name, currency, category, price FROM store_items WHERE name LIKE '%Profile Frame%'",
  (err, items) => {
    if (err) {
      console.error('Error:', err);
      return;
    }

    console.log('\n🖼️ Profile Frame items:');
    items.forEach((i) => {
      console.log(
        `ID: ${i.id}, Name: ${i.name}, Currency: ${i.currency}, Category: ${i.category}, Price: ${i.price}`,
      );
    });

    // Check for other potential duplicates
    db.all(
      'SELECT name, COUNT(*) as count FROM store_items GROUP BY name HAVING count > 1',
      (err2, duplicates) => {
        if (err2) {
          console.error('Duplicates error:', err2);
        } else {
          console.log('\n🔄 Duplicate item names:');
          duplicates.forEach((d) => {
            console.log(`"${d.name}" appears ${d.count} times`);
          });
        }

        // Check premium vs premium points confusion
        db.all(
          'SELECT * FROM fuel_wallets WHERE userId = 1',
          (err3, wallet) => {
            if (err3) {
              console.error('Wallet error:', err3);
            } else {
              console.log('\n💰 User 1 wallet details:');
              console.log(`Fuel Balance: ${wallet[0].balance}`);
              console.log(`Premium Balance: ${wallet[0].premiumBalance}`);
              console.log(`Premium Points: ${wallet[0].premiumPoints}`);
              console.log(
                `Total Premium Purchased: ${wallet[0].totalPremiumPurchased}`,
              );
              console.log(
                `Total Premium Spent: ${wallet[0].totalPremiumSpent}`,
              );
            }
            db.close();
          },
        );
      },
    );
  },
);
