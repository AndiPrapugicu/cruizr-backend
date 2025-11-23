require('dotenv').config();
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check fuel wallets and their balances
    console.log('💰 Checking fuel wallet balances:\n');
    
    const wallets = await client.query(`
      SELECT 
        fw.id,
        fw."userId",
        u.name,
        fw.balance,
        fw."totalEarned",
        fw."totalSpent",
        fw."streakDays",
        fw."lastLoginDate"
      FROM fuel_wallets fw
      JOIN "user" u ON u.id = fw."userId"
      ORDER BY fw."userId"
    `);
    
    console.table(wallets.rows);
    
    // Check recent fuel transactions
    console.log('\n📋 Recent fuel transactions:\n');
    
    const transactions = await client.query(`
      SELECT 
        ft.id,
        ft."walletId",
        ft.type,
        ft.amount,
        ft.reason,
        ft."balanceAfter",
        ft."createdAt"
      FROM fuel_transactions ft
      ORDER BY ft."createdAt" DESC
      LIMIT 20
    `);
    
    console.table(transactions.rows);
    
    // Check if there's a data type mismatch
    console.log('\n🔍 Checking balance column data type:\n');
    
    const columnInfo = await client.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_name = 'fuel_wallets' AND column_name = 'balance'
    `);
    
    console.table(columnInfo.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
})();
