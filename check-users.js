const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔍 Checking all users...');

db.all('SELECT * FROM user', (err, users) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  console.log('👥 All users:');
  users.forEach((u) => {
    console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
  });

  // Check fuel wallets
  db.all('SELECT * FROM fuel_wallets', (err2, wallets) => {
    if (err2) {
      console.error('Wallet error:', err2);
    } else {
      console.log('\n💰 All wallets:');
      wallets.forEach((w) => {
        console.log(
          `User ID: ${w.userId}, Fuel: ${w.balance}, Premium: ${w.premiumBalance}`,
        );
      });
    }
    db.close();
  });
});
