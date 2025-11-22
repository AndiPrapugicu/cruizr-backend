import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkStore() {
  console.log('🔍 Checking Supabase Store...\n');

  const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to Supabase\n');

    // Check tables
    const result = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%store%' OR table_name LIKE '%inventory%')
      ORDER BY table_name
    `);

    console.log('📋 Tables found:');
    result.forEach((t: any) => console.log(`  - ${t.table_name}`));
    console.log('');

    // Check store_items
    const items = await AppDataSource.query(`
      SELECT COUNT(*) as count FROM store_items
    `);
    console.log(`🛒 Store items: ${items[0].count}\n`);

    await AppDataSource.destroy();
    console.log('✅ Check complete!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

checkStore()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
