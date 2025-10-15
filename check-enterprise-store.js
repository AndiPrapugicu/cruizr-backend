const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🛍️ ENTERPRISE STORE ITEMS:\n');

db.all(
  `SELECT 
  id, name, currency, price, realMoneyCost, type, isPermanent, features
  FROM store_items 
  ORDER BY 
    CASE currency 
      WHEN 'fuel' THEN 1 
      WHEN 'premium' THEN 2 
      WHEN 'usd' THEN 3 
    END, price`,
  (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }

    let fuelItems = rows.filter((r) => r.currency === 'fuel');
    let premiumItems = rows.filter((r) => r.currency === 'premium');
    let usdItems = rows.filter((r) => r.currency === 'usd');

    console.log('🔥 FUEL ITEMS (🔥):');
    fuelItems.forEach((r) => {
      const permanent = r.isPermanent ? ' 🔒PERMANENT' : '';
      console.log(
        `  ${r.id}. ${r.name} - ${r.price} Fuel (${r.type})${permanent}`,
      );
    });

    console.log('\n💎 PREMIUM ITEMS (💎):');
    premiumItems.forEach((r) => {
      const permanent = r.isPermanent ? ' 🔒PERMANENT' : '';
      console.log(
        `  ${r.id}. ${r.name} - ${r.price} Diamonds (${r.type})${permanent}`,
      );
    });

    console.log('\n💰 REAL MONEY ITEMS ($):');
    usdItems.forEach((r) => {
      console.log(`  ${r.id}. ${r.name} - $${r.realMoneyCost} (${r.type})`);
    });

    console.log('\n📊 SUMMARY:');
    console.log(`Total Items: ${rows.length}`);
    console.log(`🔥 Fuel Items: ${fuelItems.length}`);
    console.log(`💎 Premium Items: ${premiumItems.length}`);
    console.log(`💰 Real Money Items: ${usdItems.length}`);
    console.log(
      `🔒 Permanent Items: ${rows.filter((r) => r.isPermanent).length}`,
    );

    // Check key features
    console.log('\n⭐ KEY FEATURES:');
    const unlimitedSwipes = rows.find((r) => r.type === 'unlimited_swipes');
    const premiumMembership = rows.find(
      (r) => r.itemId === 'premium-membership-permanent',
    );
    const vipStatus = rows.find((r) => r.itemId === 'vip-status-permanent');

    if (unlimitedSwipes) {
      console.log(
        `✅ Unlimited Swipes (24h): ${unlimitedSwipes.price} diamonds`,
      );
    }

    if (premiumMembership) {
      console.log(
        `✅ Premium Membership (Permanent): ${premiumMembership.price} diamonds`,
      );
    }

    if (vipStatus) {
      console.log(`✅ VIP Status (Permanent): ${vipStatus.price} diamonds`);
    }

    db.close();
  },
);
