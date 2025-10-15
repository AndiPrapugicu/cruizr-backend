import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [],
  synchronize: false,
});

async function checkTableStructure() {
  try {
    await AppDataSource.initialize();

    const result = await AppDataSource.query('PRAGMA table_info(store_items)');

    console.log('=== TABLE STRUCTURE ===');
    result.forEach((column: any) => {
      console.log(`${column.name} (${column.type})`);
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTableStructure();
